import {
  activeIndices,
  investigationFor,
  transferFor,
} from "./investigations.js";

export function newSession(lessonId, mode = "reviewed") {
  return {
    version: 2,
    id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
    lessonId,
    mode,
    phase: "belief",
    step: 0,
    confidence: 3,
    finalConfidence: 3,
    belief: "",
    focus: null,
    prediction: { choice: null, checked: false },
    responses: Array.from({ length: 3 }, () => ({
      answer: "",
      revision: "",
      attempt: 1,
      reviewState: "idle",
      feedback: null,
      choice: null,
      checked: false,
      revised: false,
    })),
    transferChoice: null,
    transferChecked: false,
    completed: false,
    persisted: false,
  };
}

export function sessionValid(value, lessonIds) {
  if (
    !value ||
    typeof value.id !== "string" ||
    !value.id.length ||
    value.id.length > 100 ||
    value.version !== 2 ||
    !lessonIds.includes(value.lessonId) ||
    !["reviewed", "local-ai"].includes(value.mode) ||
    ![
      "belief",
      "route",
      "predict",
      "answer",
      "review",
      "transfer",
      "summary",
    ].includes(value.phase) ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step > 2 ||
    !Array.isArray(value.responses) ||
    value.responses.length !== 3 ||
    typeof value.completed !== "boolean" ||
    typeof value.persisted !== "boolean" ||
    typeof value.transferChecked !== "boolean" ||
    ![null, 0, 1, 2, 3].includes(value.transferChoice)
  )
    return false;
  const focus = investigationFor(value);
  if (
    value.focus != null &&
    (!focus || value.lessonId !== "stress" || value.step !== focus.index)
  )
    return false;
  if (value.phase === "predict" && !focus) return false;
  if (
    focus &&
    (!value.prediction ||
      (value.phase !== "predict" && !value.prediction.checked))
  )
    return false;
  if (value.phase === "route" && value.lessonId !== "stress") return false;
  if (
    value.prediction !== undefined &&
    (!value.prediction ||
      ![null, 0, 1, 2].includes(value.prediction.choice) ||
      typeof value.prediction.checked !== "boolean" ||
      (value.prediction.checked && value.prediction.choice === null))
  )
    return false;
  if (
    typeof value.belief !== "string" ||
    value.belief.length > 4000 ||
    ![value.confidence, value.finalConfidence].every(
      (n) => Number.isInteger(n) && n >= 1 && n <= 5,
    )
  )
    return false;
  const feedbackValid = (feedback) =>
    feedback === null ||
    (feedback &&
      typeof feedback === "object" &&
      ["supported", "partial", "revisit"].includes(feedback.verdict) &&
      typeof feedback.feedback === "string" &&
      feedback.feedback.length <= 2000 &&
      (feedback.quote === undefined ||
        (typeof feedback.quote === "string" &&
          feedback.quote.length <= 2000)) &&
      (feedback.warning === undefined ||
        (typeof feedback.warning === "string" &&
          feedback.warning.length <= 2000)) &&
      (feedback.source === undefined || feedback.source === "local-ai"));
  return value.responses.every(
    (r) =>
      r &&
      typeof r.checked === "boolean" &&
      typeof r.revised === "boolean" &&
      typeof r.answer === "string" &&
      r.answer.length <= 2000 &&
      typeof r.revision === "string" &&
      r.revision.length <= 2000 &&
      (r.feedbackAnswer === undefined ||
        (typeof r.feedbackAnswer === "string" &&
          r.feedbackAnswer.length <= 2000)) &&
      [r.feedbackForRevision, r.revising].every(
        (flag) => flag === undefined || typeof flag === "boolean",
      ) &&
      (r.reviewState === undefined ||
        ["idle", "pending", "complete", "failed", "skipped", "capped"].includes(
          r.reviewState,
        )) &&
      Number.isInteger(r.attempt) &&
      r.attempt >= 1 &&
      r.attempt <= 3 &&
      [null, 0, 1, 2, 3].includes(r.choice) &&
      feedbackValid(r.feedback),
  );
}

/** New rounds consume the three-review budget; retries reuse the same snapshot. */
export function reviewCount(response) {
  if (response.reviewState === "idle") return 0;
  return response.reviewState !== undefined ||
    typeof response.feedbackAnswer === "string" ||
    response.feedback ||
    response.attempt > 1
    ? response.attempt
    : 0;
}

export function canRetryReview(response) {
  return (
    reviewCount(response) > 0 &&
    (["failed", "skipped", "pending"].includes(response.reviewState) ||
      (response.reviewState === undefined && !response.feedback))
  );
}

export function startReviewRound(
  response,
  answer,
  { revision = false, retry = false } = {},
) {
  if (retry) {
    if (!canRetryReview(response)) return false;
    // Older v2 drafts may not have stored the reviewed text yet.
    if (typeof response.feedbackAnswer !== "string")
      response.feedbackAnswer = answer;
  } else {
    const count = reviewCount(response);
    if (count >= 3) {
      response.reviewState = "capped";
      response.feedback = null;
      return false;
    }
    response.attempt = count + 1;
    response.feedbackAnswer = answer;
    response.feedbackForRevision = revision;
  }
  response.feedback = null;
  response.reviewState = "pending";
  return true;
}

export function advance(session) {
  const response = session.responses[session.step];
  if (!response.checked)
    throw new Error("Complete this quick check before moving on.");
  if (investigationFor(session)) session.phase = "transfer";
  else if (session.step < 2) {
    session.step++;
    session.phase = "answer";
  } else session.phase = "transfer";
  return session;
}

export function resultSummary(session, lesson) {
  const checks = activeIndices(session).map((index) => ({
    index,
    title: lesson.steps[index].title,
    passed:
      session.responses[index].checked &&
      session.responses[index].choice === lesson.steps[index].checkpoint.answer,
    answer: session.responses[index].answer,
    revision: session.responses[index].revision,
    feedback: session.responses[index].feedback,
  }));
  return {
    checks,
    total: checks.length,
    passed: checks.filter((c) => c.passed).length,
    transferPassed:
      session.transferChecked &&
      session.transferChoice === transferFor(session, lesson).answer,
  };
}
