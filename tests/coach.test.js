import test from "node:test";
import assert from "node:assert/strict";
import {
  createCoach,
  validateInput,
  validateFeedback,
} from "../scripts/coach.mjs";

const input = {
  action: "feedback",
  lessonId: "stress",
  questionIndex: 0,
  answer:
    "Stress is force divided by area, so twice the area means half the stress.",
  attempt: 1,
};
const feedback = () => ({
  verdict: "supported",
  feedback:
    "You linked stress to both force and area and applied the inverse relationship.",
  quote: "twice the area means half the stress",
});

test("feedback input targets one authored question and one answer", () => {
  const result = validateInput(input);
  assert.equal(result.index, 0);
  assert.equal(result.lesson.id, "stress");
});

test("focused feedback rejects investigation context from a different question or lesson", () => {
  assert.equal(
    validateInput({ ...input, questionIndex: 1, investigationId: "stiffness" })
      .index,
    1,
  );
  for (const fields of [
    { investigationId: "stiffness" },
    { investigationId: "unknown" },
    { investigationId: null },
    { lessonId: "probability", investigationId: "area" },
  ]) {
    assert.throws(
      () => validateInput({ ...input, ...fields }),
      /investigation must match/,
    );
  }
});

test("focused coaching receives the fictional counterexample and its physical limits", async () => {
  const answer =
    "Young's modulus measures the initial slope, while strength is a separate failure limit.";
  const coach = createCoach({
    generate: async ({ prompt }) => {
      const context = JSON.parse(prompt.slice(prompt.indexOf("\n") + 1));
      assert.equal(context.fictionalMaterials[0].youngGPa, 200);
      assert.equal(context.fictionalMaterials[0].strengthMPa, 150);
      assert.equal(context.fictionalMaterials[1].strengthMPa, 300);
      assert.match(
        context.investigation,
        /stiffer but reaches its failure limit first/,
      );
      assert.match(
        context.modelAssumptions,
        /Do not calculate an elastic extension for a failed rod/,
      );
      assert.equal(context.currentAnswer, answer);
      return {
        output: {
          ...feedback(),
          quote: "strength is a separate failure limit",
        },
      };
    },
  });
  const result = await coach.respond({
    ...input,
    questionIndex: 1,
    investigationId: "stiffness",
    answer,
  });
  assert.equal(result.criterionIndex, 1);
  assert.equal(result.evidenceSource, "answer");
});

test("unsupported actions, unknown lessons, invalid attempts, and answer bounds are rejected", () => {
  assert.throws(
    () => validateInput({ ...input, action: "report" }),
    /feedback action/,
  );
  assert.throws(
    () => validateInput({ ...input, lessonId: "unknown" }),
    /prepared lessons/,
  );
  assert.throws(
    () => validateInput({ ...input, questionIndex: 3 }),
    /question number/,
  );
  assert.throws(
    () => validateInput({ ...input, attempt: 0 }),
    /three feedback attempts/,
  );
  assert.throws(
    () => validateInput({ ...input, attempt: 4 }),
    /three feedback attempts/,
  );
  assert.throws(
    () => validateInput({ ...input, answer: "          " }),
    /10–2000/,
  );
  assert.throws(
    () => validateInput({ ...input, answer: "a".repeat(2001) }),
    /10–2000/,
  );
  assert.throws(
    () => validateInput({ ...input, initialExplanation: {} }),
    /4000 characters/,
  );
});

test("real current-answer excerpts retain explicit provenance without a numerical grade", async () => {
  const coach = createCoach({ generate: async () => ({ output: feedback() }) });
  const result = await coach.respond(input);
  assert.equal(result.verdict, "supported");
  assert.equal(result.quote, "twice the area means half the stress");
  assert.equal(result.evidenceSource, "answer");
  assert.equal(result.criterionIndex, 0);
  assert.equal(result.source, "local-ai");
  assert.equal(result.model, "gpt-oss:20b");
  assert.equal("score" in result, false);
});

test("quotes from an initial explanation cannot support the current answer", async () => {
  const quote = "The initial slope measures stiffness, not strength.";
  const coach = createCoach({
    generate: async () => ({ output: { ...feedback(), quote } }),
  });
  const result = await coach.respond({ ...input, initialExplanation: quote });
  assert.equal(result.verdict, "partial");
  assert.equal(result.quote, "");
  assert.match(result.warning, /did not match this answer/);
});

test("a fabricated quote downgrades the verdict with an explicit warning", () => {
  const result = validateFeedback(
    { ...feedback(), quote: "A sentence that was never written." },
    input.answer,
  );
  assert.equal(result.verdict, "partial");
  assert.equal(result.quote, "");
  assert.match(result.warning, /No mastery claim/);
  assert.doesNotMatch(result.feedback, /correctly|great job|well done/i);
});

test("supported requires a quote; uncertain feedback can honestly omit one", () => {
  assert.equal(
    validateFeedback({ ...feedback(), quote: "" }, input.answer).verdict,
    "partial",
  );
  const result = validateFeedback(
    {
      verdict: "revisit",
      feedback: "Check how area changes stress at fixed force.",
      quote: "",
    },
    input.answer,
  );
  assert.equal(result.verdict, "revisit");
  assert.equal(result.warning, undefined);
});

test("quote checks tolerate typographical whitespace and punctuation without accepting another response", () => {
  const result = validateFeedback(
    { ...feedback(), quote: "cross-sectional area" },
    "Stress depends on cross‑sectional   area at fixed force.",
  );
  assert.equal(result.verdict, "supported");
});

test("malformed model objects are rejected before rendering", () => {
  for (const invalid of [
    null,
    {},
    { ...feedback(), verdict: "100%" },
    { ...feedback(), feedback: 3 },
    { ...feedback(), quote: "a".repeat(241) },
  ]) {
    assert.throws(
      () => validateFeedback(invalid, input.answer),
      /worked answer is still available/,
    );
  }
});

test("the prompt isolates the answer and supplies the exact reviewed question and criterion", async () => {
  const coach = createCoach({
    generate: async (options) => {
      assert.match(options.prompt, /If you double the cross-sectional area/);
      assert.match(options.prompt, /Stress relates force to area/);
      assert.match(options.prompt, /currentAnswer/);
      assert.doesNotMatch(options.prompt, /earlier unrelated explanation/);
      assert.match(
        options.system,
        /Mere keywords or vague statements are insufficient/,
      );
      assert.match(
        options.system,
        /never from a reference or earlier explanation/,
      );
      assert.equal(options.maxRetries, 0);
      assert.equal(options.maxOutputTokens, 420);
      return { output: feedback() };
    },
  });
  await coach.respond({
    ...input,
    initialExplanation: "earlier unrelated explanation",
  });
});

test("only loopback HTTP inference endpoints are accepted", () => {
  for (const baseURL of [
    "https://example.com/v1",
    "http://example.com/v1",
    "http://user:secret@127.0.0.1/v1",
    "http://127.0.0.1/v1?key=test",
  ]) {
    assert.throws(() => createCoach({ baseURL }), /loopback/);
  }
});

test("status detects a model started later without requiring a new coach instance", async () => {
  let available = false;
  const coach = createCoach({
    fetchModels: async () => ({
      ok: true,
      json: async () => ({ data: available ? [{ id: "gpt-oss:20b" }] : [] }),
    }),
  });
  assert.equal((await coach.status()).available, false);
  available = true;
  assert.equal((await coach.status()).available, true);
});

test("caller cancellation reaches the model operation", async () => {
  const controller = new AbortController();
  let begin;
  const started = new Promise((resolve) => {
    begin = resolve;
  });
  const coach = createCoach({
    generate: async ({ abortSignal }) => {
      begin();
      await new Promise((resolve, reject) =>
        abortSignal.addEventListener(
          "abort",
          () => reject(abortSignal.reason),
          { once: true },
        ),
      );
    },
  });
  const pending = coach.respond(input, controller.signal);
  const rejected = assert.rejects(pending, /cancelled by learner/);
  await started;
  controller.abort(new Error("cancelled by learner"));
  await rejected;
});

test(
  "optional real Ollama feedback smoke test",
  { skip: process.env.RUN_LOCAL_AI_SMOKE !== "1", timeout: 55000 },
  async () => {
    const result = await createCoach().respond(input);
    assert.equal(result.source, "local-ai");
    assert.equal(result.criterionIndex, 0);
    assert.ok(["supported", "partial", "revisit"].includes(result.verdict));
    assert.ok(result.feedback.length > 0);
    assert.equal("score" in result, false);
  },
);
