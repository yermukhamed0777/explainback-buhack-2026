import { createAppServer } from "./serve.mjs";
import { CoachError } from "./coach.mjs";

// Deterministic development fixtures. This server never calls Ollama, opens
// external connections, or accepts the model as an authority on correct answers.
const failures = new Map();
const delay = (ms, signal) =>
  new Promise((resolve, reject) => {
    const done = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const timer = setTimeout(done, ms);
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(new Error("Fixture request cancelled"));
    };
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
const coach = {
  status: async () => ({ available: true, model: "deterministic-test-tutor" }),
  respond: async (input, signal) => {
    if (input.action !== "feedback")
      throw new CoachError("The fixture only supports feedback.");
    if (input.answer.includes("[fail-once]")) {
      const count = failures.get(input.answer) || 0;
      failures.set(input.answer, count + 1);
      if (count === 0)
        throw new CoachError(
          "The test tutor could not answer. Your explanation is kept.",
          502,
        );
    }
    if (input.answer.includes("[fail]"))
      throw new CoachError(
        "The test tutor is unavailable. Your explanation is kept.",
        502,
      );
    await delay(input.answer.includes("[slow]") ? 30000 : 180, signal);
    return {
      source: "local-ai",
      model: "deterministic-test-tutor",
      verdict: "partial",
      feedback: input.answer.includes("[escape]")
        ? '<img src=x onerror=alert("model")><script>window.modelInjected=true</script>'
        : "You explained part of the idea. Compare your reasoning with the lesson answer below.",
      quote: input.answer.slice(0, 160),
      evidenceSource: "answer",
      criterionIndex: input.questionIndex,
    };
  },
};
const server = createAppServer(coach, {
  minCoachIntervalMs: 0,
  maxCoachRequests: 1000,
  statusCacheMs: 10,
});
server.listen(4180, "127.0.0.1", () =>
  console.log("ExplainBack deterministic test server: http://127.0.0.1:4180"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
  });
