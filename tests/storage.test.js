import test from "node:test";
import assert from "node:assert/strict";
import {
  readStored,
  writeStored,
  removeStored,
  appendHistory,
} from "../dist/storage.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test("successful draft persistence can be read back as structured data", () => {
  const storage = memoryStorage();
  const draft = {
    id: "practice-1",
    belief: "Force and stress are different.",
    step: 1,
  };
  assert.equal(writeStored(storage, "draft", draft).ok, true);
  assert.deepEqual(readStored(storage, "draft", null), draft);
});

test("unavailable, blocked, and full storage are never reported as a successful save", () => {
  for (const storage of [
    undefined,
    {
      setItem() {
        throw new Error("Quota exceeded");
      },
    },
    {
      setItem() {
        throw new Error("Storage access denied");
      },
    },
  ]) {
    const result = writeStored(storage, "draft", {
      answer: "My current reasoning",
    });
    assert.equal(result.ok, false);
    assert.match(result.message, /unavailable|not saved/i);
    assert.match(result.message, /download|page/i);
  }
});

test("malformed or unreadable drafts fall back safely instead of stopping the app", () => {
  const storage = memoryStorage();
  storage.setItem("draft", "{bad json");
  assert.equal(readStored(storage, "draft", null), null);
  assert.deepEqual(
    readStored(
      {
        getItem() {
          throw new Error("Blocked");
        },
      },
      "draft",
      [],
    ),
    [],
  );
  assert.equal(readStored(undefined, "draft", "default"), "default");
});

test("finishing the same session twice updates its history entry rather than duplicating it", () => {
  const storage = memoryStorage();
  appendHistory(storage, { id: "session-a", lessonId: "stress", passed: 1 });
  appendHistory(storage, {
    id: "session-b",
    lessonId: "probability",
    passed: 2,
  });
  const updated = appendHistory(storage, {
    id: "session-a",
    lessonId: "stress",
    passed: 3,
  });
  assert.equal(updated.ok, true);
  assert.deepEqual(
    updated.history.map((entry) => entry.id),
    ["session-a", "session-b"],
  );
  assert.equal(updated.history[0].passed, 3);
  assert.equal(readStored(storage, "explainback-history-v2", []).length, 2);
});

test("history stays bounded and invalid saved entries cannot crash completion", () => {
  const storage = memoryStorage();
  for (let index = 0; index < 35; index++)
    appendHistory(storage, { id: `session-${index}`, lessonId: "stress" });
  assert.equal(readStored(storage, "explainback-history-v2", []).length, 30);
  storage.setItem(
    "explainback-history-v2",
    JSON.stringify([null, "corrupt", { id: "valid-old", lessonId: "stress" }]),
  );
  const result = appendHistory(storage, {
    id: "new-session",
    lessonId: "stress",
  });
  assert.equal(result.ok, true);
  assert.deepEqual(
    result.history.map((entry) => entry.id),
    ["new-session", "valid-old"],
  );
});

test("a failed history write returns the unsaved history and a failure state", () => {
  const result = appendHistory(
    {
      getItem() {
        return "[]";
      },
      setItem() {
        throw new Error("Full");
      },
    },
    { id: "unsaved-session" },
  );
  assert.equal(result.ok, false);
  assert.equal(result.history[0].id, "unsaved-session");
});

test("removing saved progress reports access errors accurately", () => {
  const storage = memoryStorage();
  writeStored(storage, "draft", { id: "old" });
  assert.equal(removeStored(storage, "draft"), true);
  assert.equal(readStored(storage, "draft", null), null);
  assert.equal(
    removeStored(
      {
        removeItem() {
          throw new Error("Blocked");
        },
      },
      "draft",
    ),
    false,
  );
});
