import test from "node:test";
import assert from "node:assert/strict";
import { stress, extension, opportunity } from "../dist/labs.js";

test("the stress lab holds force constant and halves stress when area doubles", () => {
  assert.equal(stress(100, 1), 100);
  assert.equal(stress(100, 2), 50);
  assert.equal(stress(100, 4), 25);
});
test("the linear elastic comparison changes extension inversely with modulus", () => {
  assert.equal(extension(1), 2);
  assert.equal(extension(2), 1);
  assert.equal(extension(4), 0.5);
});
test("the trade-off lab uses the best forgone alternative, excluding the chosen option", () => {
  const options = [150, 100, 80];
  assert.equal(opportunity(options, 0), 100);
  assert.equal(opportunity(options, 1), 150);
  assert.equal(opportunity(options, 2), 150);
});
