import test from "node:test";
import assert from "node:assert/strict";
import { lessons } from "../dist/lessons.js";

test("every learning question has an answer, explanation, hint, and independent checkpoint", () => {
  for (const lesson of lessons) {
    assert.equal(lesson.steps.length, lesson.questions.length, lesson.id);
    for (const [index, step] of lesson.steps.entries()) {
      for (const field of [
        "title",
        "answer",
        "why",
        "misconception",
        "workedExample",
        "hint",
      ]) {
        assert.equal(
          typeof step[field],
          "string",
          `${lesson.id} step ${index + 1}: ${field}`,
        );
        assert.ok(
          step[field].trim().length > 10,
          `${lesson.id} step ${index + 1}: empty ${field}`,
        );
      }
      assert.equal(step.checkpoint.options.length, 4);
      assert.equal(new Set(step.checkpoint.options).size, 4);
      assert.ok(Number.isInteger(step.checkpoint.answer));
      assert.ok(step.checkpoint.options[step.checkpoint.answer]);
      assert.ok(step.checkpoint.explanation.length > 30);
      assert.notEqual(
        step.checkpoint.question,
        lesson.questions[index],
        "The checkpoint should apply the idea in a new situation.",
      );
    }
  }
});

test("mechanics checkpoint answers follow force/area, modulus, and residual strain", () => {
  const [area, slope, unload] = lessons.find((l) => l.id === "stress").steps;
  assert.equal(
    area.checkpoint.options[area.checkpoint.answer],
    `${200 / 20} MPa`,
  );
  assert.equal(
    slope.checkpoint.options[slope.checkpoint.answer],
    "A has twice the Young’s modulus",
  );
  assert.equal(
    unload.checkpoint.options[unload.checkpoint.answer],
    `${((102 - 100) / 100) * 100}%`,
  );
});

test("probability checks separate independence, joint outcomes, and exclusivity", () => {
  const [next, both, exclusive] = lessons.find(
    (l) => l.id === "probability",
  ).steps;
  assert.equal(next.checkpoint.options[next.checkpoint.answer], "70%");
  assert.equal(both.checkpoint.options[both.checkpoint.answer], `1/${6 * 2}`);
  assert.equal(
    exclusive.checkpoint.options[exclusive.checkpoint.answer],
    "Mutually exclusive only",
  );
});

test("economics checkpoints use the next-best alternative and future incremental outcomes", () => {
  const [nextBest, time, sunk] = lessons.find(
    (l) => l.id === "economics",
  ).steps;
  assert.equal(
    nextBest.checkpoint.options[nextBest.checkpoint.answer],
    `$${Math.max(220, 100)}`,
  );
  assert.equal(
    time.checkpoint.options[time.checkpoint.answer],
    "The value of the interview practice forgone",
  );
  assert.ok(80 > 40 - 30);
  assert.equal(
    sunk.checkpoint.options[sunk.checkpoint.answer],
    "Its $80 future value exceeds the $10 net future benefit of attending",
  );
});
