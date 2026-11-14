import test from "node:test";
import assert from "node:assert/strict";
import { newSession, startReviewRound } from "../dist/session.js";
import { reviewView } from "../dist/views.js";
import { lessons } from "../dist/lessons.js";

const ui = { lab: {}, busy: false, error: "", elapsed: 0 };

test("a capped edited answer keeps teaching and the quick check without offering a retry", () => {
  const session = newSession("stress", "local-ai");
  session.phase = "review";
  const response = session.responses[0];
  for (let i = 0; i < 3; i++) {
    startReviewRound(response, `Review round ${i + 1}.`);
    response.reviewState = "complete";
  }
  startReviewRound(response, "This edited answer exceeds the review budget.");
  const html = reviewView(session, lessons[0], ui);
  assert.match(html, /data-testid="review-limit"/);
  assert.match(html, /all three local reviews/);
  assert.doesNotMatch(html, /data-action="retry-feedback"/);
  assert.match(html, /data-testid="canonical-answer"/);
  assert.match(html, /data-testid="check-understanding"/);
});

test("failed and skipped reviews offer an explicit retry of the same round", () => {
  for (const state of ["failed", "skipped", "pending"]) {
    const session = newSession("stress", "local-ai");
    session.phase = "review";
    const response = session.responses[0];
    startReviewRound(response, "An answer whose review can be retried.");
    response.reviewState = state;
    const html = reviewView(session, lessons[0], {
      ...ui,
      error: state === "failed" ? "The local tutor failed." : "",
    });
    assert.match(html, /data-action="retry-feedback"/);
    assert.match(html, /data-testid="canonical-answer"/);
  }
});
