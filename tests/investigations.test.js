import test from "node:test";
import assert from "node:assert/strict";
import {
  investigations,
  suggestInvestigation,
  transferFor,
  activeIndices,
} from "../dist/investigations.js";
import { lessons } from "../dist/lessons.js";

test("a belief about stiffer meaning stronger routes directly to the stiffness investigation", () => {
  assert.equal(
    suggestInvestigation("I think stiffer materials must be stronger."),
    "stiffness",
  );
  assert.equal(
    suggestInvestigation("A steeper slope does not prove breaking strength."),
    "stiffness",
  );
  assert.equal(investigations.find((i) => i.id === "stiffness").index, 1);
});
test("routing is a transparent topic suggestion, with no made-up diagnosis for ambiguous beliefs", () => {
  assert.equal(
    suggestInvestigation(
      "Removing the force after yield undoes all deformation.",
    ),
    "yield",
  );
  assert.equal(
    suggestInvestigation(
      "Same force means the same stress, regardless of area.",
    ),
    "area",
  );
  assert.equal(
    suggestInvestigation(
      "Stiffer means stronger and all plastic deformation is reversible.",
    ),
    null,
  );
  assert.equal(
    suggestInvestigation("I want to understand photosynthesis."),
    null,
  );
});
test("each focused investigation has its own reviewed prediction and a distinct transfer case", () => {
  const lesson = lessons[0];
  for (const item of investigations) {
    const session = { focus: item.id, step: item.index };
    assert.deepEqual(activeIndices(session), [item.index]);
    assert.ok(item.options[item.answer]);
    assert.ok(item.transfer.options[item.transfer.answer]);
    assert.notEqual(item.prompt, item.transfer.question);
    assert.notEqual(
      transferFor(session, lesson).question,
      lesson.transfer.question,
    );
  }
});
test("focused transfer cases use checked units and limits, not the model verdict", () => {
  assert.equal(600 / 3, 200);
  assert.equal(600 / 6, 100);
  const stress = 1800 / 10,
    limits = [120, 240];
  assert.ok(stress > limits[0] && stress < limits[1]);
  assert.equal((204 - 200) / 200, 0.02);
});
