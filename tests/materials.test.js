// tests/materials.test.js
import { materialResponse, MATERIALS } from "../dist/materials.js";
import assert from "node:assert/strict";
import test from "node:test";

const A = MATERIALS.find((m) => m.id === "a");
const B = MATERIALS.find((m) => m.id === "b");

test("A and B intact at low force", () => {
  const rA = materialResponse(A, 1000, 10, 1000);
  const rB = materialResponse(B, 1000, 10, 1000);
  assert.strictEqual(rA.failed, false);
  assert.strictEqual(rB.failed, false);
  assert.strictEqual(rA.stressMPa, 100); // 1000/10
  assert.deepEqual(rA.extensionMM, 0.5); // strain =100/200000=0.0005 *1000
  assert.deepEqual(rB.extensionMM, 1); // strain=100/100000=0.001*1000
});

test("B remains intact at higher force, A fails", () => {
  const rA = materialResponse(A, 2000, 10, 1000);
  const rB = materialResponse(B, 2000, 10, 1000);
  assert.strictEqual(rA.failed, true);
  assert.strictEqual(rB.failed, false);
  assert.strictEqual(rA.strain, null);
  assert.strictEqual(rA.extensionMM, null);
  assert.strictEqual(rB.extensionMM, 2);
});

test("force at threshold for A", () => {
  const threshold = A.strengthMPa * 10; // 150*10=1500
  const r = materialResponse(A, threshold, 10, 1000);
  assert.strictEqual(r.failed, true);
  assert.strictEqual(r.strain, null);
});

test("doubling area doubles failure force", () => {
  const r1 = materialResponse(A, 1500, 10, 1000);
  const r2 = materialResponse(A, 3000, 20, 1000);
  assert.deepEqual(r2.failureForceN, r1.failureForceN * 2);
});

test("invalid inputs throw RangeError", () => {
  assert.throws(() => materialResponse(A, -1, 10, 1000), RangeError);
  assert.throws(() => materialResponse(A, 1000, 0, 1000), RangeError);
  assert.throws(() => materialResponse(A, 1000, 10, -5), RangeError);
  for (const material of [
    null,
    { youngGPa: "200", strengthMPa: 150 },
    { youngGPa: NaN, strengthMPa: 150 },
    { youngGPa: 200, strengthMPa: Infinity },
  ])
    assert.throws(() => materialResponse(material, 1000), RangeError);
  assert.throws(() => materialResponse(A, Infinity), RangeError);
});

test("zero load is permitted and the input material is not mutated", () => {
  const original = { ...A };
  assert.equal(materialResponse(A, 0).extensionMM, 0);
  materialResponse(A, 2000);
  assert.deepEqual(A, original);
});
