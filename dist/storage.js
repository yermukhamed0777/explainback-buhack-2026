export function readStored(storage, key, fallback) {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function writeStored(storage, key, value) {
  try {
    if (!storage) throw new Error("Storage unavailable");
    storage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Browser storage is unavailable. Your work is kept on this page; download your learning card before closing it.",
    };
  }
}
export function removeStored(storage, key) {
  try {
    storage?.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
export function appendHistory(storage, entry) {
  const raw = readStored(storage, "explainback-history-v2", []);
  const previous = Array.isArray(raw)
    ? raw.filter((item) => item && typeof item.id === "string")
    : [];
  const history = [
    entry,
    ...previous.filter((item) => item.id !== entry.id),
  ].slice(0, 30);
  return {
    ...writeStored(storage, "explainback-history-v2", history),
    history,
  };
}
