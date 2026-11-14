import test from "node:test";
import assert from "node:assert/strict";
import {
  newSession,
  sessionValid,
  advance,
  resultSummary,
} from "../dist/session.js";
import { lessons } from "../dist/lessons.js";

const ids = lessons.map((lesson) => lesson.id);

test("a new session survives a JSON draft round-trip without losing the learning state", () => {
  const session = newSession("stress", "local-ai");
  session.belief = "A steeper slope must mean a stronger material.";
  session.phase = "review";
  session.responses[0].answer =
    "Stress is the same because the force is unchanged.";
  session.responses[0].feedback = {
    verdict: "revisit",
    feedback: "Consider how the force is spread across the area.",
  };
  const restored = JSON.parse(JSON.stringify(session));
  assert.ok(sessionValid(restored, ids));
  assert.equal(restored.mode, "local-ai");
  assert.equal(restored.belief, session.belief);
  assert.equal(restored.responses[0].answer, session.responses[0].answer);
  assert.equal(restored.phase, "review");
});

test("restored drafts reject unsupported lessons, phases, and invalid controls", () => {
  for (const patch of [
    { lessonId: "outside-the-curriculum" },
    { mode: "remote-agent" },
    { phase: "waiting-forever" },
    { step: 3 },
    { confidence: 0 },
    { finalConfidence: 6 },
    { belief: "x".repeat(4001) },
    { responses: [] },
  ]) {
    assert.equal(
      sessionValid({ ...newSession("stress"), ...patch }, ids),
      false,
      JSON.stringify(patch).slice(0, 80),
    );
  }
  const badChoice = newSession("stress");
  badChoice.responses[0].choice = 4;
  assert.equal(sessionValid(badChoice, ids), false);
  const badAttempt = newSession("stress");
  badAttempt.responses[0].attempt = 0;
  assert.equal(sessionValid(badAttempt, ids), false);
});

test("corrupted identifiers and truthy strings cannot turn an unfinished draft into a completed result", () => {
  const missingId = newSession("stress");
  delete missingId.id;
  assert.equal(sessionValid(missingId, ids), false);
  const misleadingFlag = newSession("stress");
  misleadingFlag.responses[0].checked = "false";
  assert.equal(sessionValid(misleadingFlag, ids), false);
  const misleadingCompletion = newSession("stress");
  misleadingCompletion.completed = "false";
  assert.equal(sessionValid(misleadingCompletion, ids), false);
});

test("restored feedback rejects injected verdicts and malformed display fields", () => {
  const validFeedback = {
    verdict: "supported",
    feedback: "The answer distinguishes force from stress.",
    quote: "Stress is force divided by area.",
    source: "local-ai",
  };
  const valid = newSession("stress", "local-ai");
  valid.responses[0].feedback = validFeedback;
  assert.equal(sessionValid(valid, ids), true);
  for (const patch of [
    { verdict: 'supported" onclick="alert(1)' },
    { verdict: "<script>alert(1)</script>" },
    { verdict: "__proto__" },
    { verdict: true },
    { feedback: { html: "<img src=x>" } },
    { quote: ["untrusted", "array"] },
    { warning: { message: "invalid object" } },
    { source: "unreviewed-remote-source" },
  ]) {
    const restored = newSession("stress", "local-ai");
    restored.responses[0].feedback = { ...validFeedback, ...patch };
    assert.equal(sessionValid(restored, ids), false, JSON.stringify(patch));
  }
});

test("the learner advances only after checking an answer, including a wrong answer with an explanation", () => {
  const session = newSession("stress");
  session.phase = "review";
  assert.throws(() => advance(session), /check/i);
  session.responses[0].choice = 0; // Incorrect is still a completed learning check.
  session.responses[0].checked = true;
  advance(session);
  assert.equal(session.step, 1);
  assert.equal(session.phase, "answer");
  session.responses[1].checked = true;
  advance(session);
  assert.equal(session.step, 2);
  assert.equal(session.phase, "answer");
  session.responses[2].checked = true;
  advance(session);
  assert.equal(session.phase, "transfer");
});

test("the learning summary uses objective checks rather than an AI verdict as proof", () => {
  const lesson = lessons.find((item) => item.id === "stress");
  const session = newSession(lesson.id, "local-ai");
  session.responses[0].choice = lesson.steps[0].checkpoint.answer;
  session.responses[0].checked = true;
  session.responses[1].choice = 0;
  session.responses[1].checked = true;
  session.responses[2].choice = lesson.steps[2].checkpoint.answer; // Selected but not checked.
  for (const response of session.responses)
    response.feedback = {
      verdict: "supported",
      feedback: "Everything looks right.",
    };
  let result = resultSummary(session, lesson);
  assert.equal(result.passed, 1);
  assert.equal(result.transferPassed, false);
  session.transferChoice = lesson.transfer.answer;
  session.transferChecked = true;
  result = resultSummary(session, lesson);
  assert.equal(result.transferPassed, true);
  assert.equal(result.checks[1].passed, false);
  assert.equal(result.checks[2].passed, false);
});
