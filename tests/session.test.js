import test from "node:test";
import assert from "node:assert/strict";
import {
  newSession,
  sessionValid,
  advance,
  resultSummary,
  reviewCount,
  startReviewRound,
  canRetryReview,
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

test("new edited answers share the three-round budget, while a retry preserves its snapshot", () => {
  const session = newSession("stress", "local-ai");
  const response = session.responses[0];
  assert.equal(reviewCount(response), 0);
  assert.equal(
    startReviewRound(response, "The first answer is reviewed."),
    true,
  );
  assert.equal(response.attempt, 1);
  response.reviewState = "complete";
  assert.equal(
    startReviewRound(response, "An edited answer gets a second round."),
    true,
  );
  assert.equal(response.attempt, 2);
  response.reviewState = "failed";
  assert.equal(canRetryReview(response), true);
  assert.equal(
    startReviewRound(
      response,
      "A different text cannot replace the retry snapshot.",
      { retry: true },
    ),
    true,
  );
  assert.equal(response.attempt, 2);
  assert.equal(
    response.feedbackAnswer,
    "An edited answer gets a second round.",
  );
  response.reviewState = "complete";
  assert.equal(
    startReviewRound(response, "A rewrite gets the third round.", {
      revision: true,
    }),
    true,
  );
  assert.equal(response.attempt, 3);
  response.reviewState = "complete";
  assert.equal(
    startReviewRound(response, "A fourth new answer must not call the model."),
    false,
  );
  assert.equal(response.reviewState, "capped");
  assert.equal(canRetryReview(response), false);
  assert.equal(
    startReviewRound(response, "No cap bypass through retry.", { retry: true }),
    false,
  );
  // Exhausting coaching never blocks the independent learning check.
  response.checked = true;
  advance(session);
  assert.equal(session.phase, "answer");
  assert.equal(session.step, 1);
});

test("skipped or interrupted third rounds can retry, including older v2 drafts", () => {
  for (const state of ["skipped", "pending", undefined]) {
    const response = newSession("stress").responses[0];
    response.attempt = 3;
    response.feedbackAnswer = "The original snapshot is kept.";
    if (state === undefined) delete response.reviewState;
    else response.reviewState = state;
    assert.equal(reviewCount(response), 3);
    assert.equal(
      startReviewRound(response, "A replacement text must not be reviewed.", {
        retry: true,
      }),
      true,
    );
    assert.equal(response.attempt, 3);
    assert.equal(response.feedbackAnswer, "The original snapshot is kept.");
  }
  const legacy = newSession("stress").responses[0];
  delete legacy.reviewState;
  assert.equal(reviewCount(legacy), 0);
  legacy.feedback = { verdict: "partial", feedback: "An earlier review." };
  assert.equal(reviewCount(legacy), 1);
});

test("restored review snapshots reject malformed content and flags without rejecting old v2 drafts", () => {
  const legacy = newSession("stress");
  for (const response of legacy.responses) delete response.reviewState;
  assert.equal(sessionValid(legacy, ids), true);
  for (const patch of [
    { feedbackAnswer: { toString: "corrupted" } },
    { feedbackAnswer: "x".repeat(2001) },
    { feedbackForRevision: "false" },
    { revising: {} },
    { reviewState: "unlimited" },
  ]) {
    const corrupt = newSession("stress", "local-ai");
    Object.assign(corrupt.responses[0], patch);
    assert.equal(sessionValid(corrupt, ids), false);
  }
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

test("a confirmed investigation starts at the relevant criterion and finishes after its single check", () => {
  const session = newSession("stress");
  session.focus = "stiffness";
  session.step = 1;
  session.phase = "predict";
  assert.equal(sessionValid(session, ids), true);
  session.prediction = { choice: 0, checked: true };
  session.phase = "review";
  session.responses[1].choice = 2;
  session.responses[1].checked = true;
  advance(session);
  assert.equal(session.phase, "transfer");
  session.transferChoice = 1;
  session.transferChecked = true;
  const summary = resultSummary(session, lessons[0]);
  assert.equal(summary.total, 1);
  assert.equal(summary.passed, 1);
  assert.equal(summary.checks[0].index, 1);
  assert.equal(summary.transferPassed, true);
});
test("restored focused sessions reject mismatched criteria and invalid predictions", () => {
  const session = newSession("stress");
  session.focus = "stiffness";
  session.step = 0;
  assert.equal(sessionValid(session, ids), false);
  session.step = 1;
  session.prediction = { choice: 3, checked: true };
  assert.equal(sessionValid(session, ids), false);
  session.prediction = { choice: null, checked: true };
  assert.equal(sessionValid(session, ids), false);
  session.prediction = { choice: 0, checked: false };
  session.lessonId = "economics";
  assert.equal(sessionValid(session, ids), false);
});
