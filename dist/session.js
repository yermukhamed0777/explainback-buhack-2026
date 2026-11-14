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
    responses: Array.from({ length: 3 }, () => ({
      answer: "",
      revision: "",
      attempt: 1,
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
    !["belief", "answer", "review", "transfer", "summary"].includes(
      value.phase,
    ) ||
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
      Number.isInteger(r.attempt) &&
      r.attempt >= 1 &&
      r.attempt <= 3 &&
      [null, 0, 1, 2, 3].includes(r.choice) &&
      feedbackValid(r.feedback),
  );
}

export function advance(session) {
  const response = session.responses[session.step];
  if (!response.checked)
    throw new Error("Complete this quick check before moving on.");
  if (session.step < 2) {
    session.step++;
    session.phase = "answer";
  } else session.phase = "transfer";
  return session;
}

export function resultSummary(session, lesson) {
  const checks = session.responses.map((response, index) => ({
    title: lesson.steps[index].title,
    passed:
      response.checked &&
      response.choice === lesson.steps[index].checkpoint.answer,
    answer: response.answer,
    revision: response.revision,
    feedback: response.feedback,
  }));
  return {
    checks,
    passed: checks.filter((c) => c.passed).length,
    transferPassed:
      session.transferChecked &&
      session.transferChoice === lesson.transfer.answer,
  };
}
