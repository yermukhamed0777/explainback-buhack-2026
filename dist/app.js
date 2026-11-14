import { lessons } from "./lessons.js";
import {
  shell,
  home,
  beliefView,
  answerView,
  reviewView,
  transferView,
  summaryView,
  historyView,
  aboutView,
} from "./views.js";
import { newSession, sessionValid, advance, resultSummary } from "./session.js";
import {
  readStored,
  writeStored,
  removeStored,
  appendHistory,
} from "./storage.js";
import { labView } from "./labs.js";

const app = document.querySelector("#app");
const draftKey = "explainback-draft-v2";
function browserStorage(name) {
  try {
    return window[name];
  } catch {
    return null;
  }
}
const local = browserStorage("localStorage"),
  draftStorage = browserStorage("sessionStorage");
const draft = readStored(draftStorage, draftKey, null);
let session = sessionValid(
  draft,
  lessons.map((l) => l.id),
)
  ? draft
  : null;
let history = readStored(local, "explainback-history-v2", []);
if (!Array.isArray(history)) history = [];
function validHistory(h) {
  return (
    h &&
    typeof h.id === "string" &&
    h.id.length <= 100 &&
    typeof h.title === "string" &&
    h.title.length <= 200 &&
    Number.isInteger(h.passed) &&
    h.passed >= 0 &&
    h.passed <= 3 &&
    [h.confidence, h.finalConfidence].every(
      (n) => Number.isInteger(n) && n >= 1 && n <= 5,
    ) &&
    typeof h.transferPassed === "boolean" &&
    ["local-ai", "reviewed"].includes(h.mode) &&
    typeof h.date === "string" &&
    Number.isFinite(new Date(h.date).getTime())
  );
}
history = history.filter(validHistory);
const ui = {
  page: "practice",
  selected: session?.lessonId || lessons[0].id,
  available: false,
  checking: true,
  mode: "reviewed",
  modeChosen: false,
  busy: false,
  elapsed: 0,
  error: "",
  storageWarning: "",
  restored: !!session,
  lab: {},
};
let active = null,
  clock = null,
  reconnectAttempt = 0;
const currentLesson = () =>
  lessons.find((l) => l.id === (session?.lessonId || ui.selected));

function persistDraft() {
  if (!session) return;
  const result = writeStored(draftStorage, draftKey, session);
  if (!result.ok) {
    ui.storageWarning = result.message;
    const warning = document.querySelector("#storage-warning");
    if (warning) {
      warning.hidden = false;
      warning.textContent = result.message;
    }
    document.querySelectorAll(".save-status").forEach((node) => {
      node.textContent = "Draft not saved. Keep this page open.";
      node.setAttribute("role", "status");
    });
  }
}

function render(focus = false) {
  const prior = document.activeElement;
  const focusedId = prior?.id,
    focusedTest = prior?.dataset?.testid;
  const selection =
    prior && "selectionStart" in prior
      ? [prior.selectionStart, prior.selectionEnd]
      : null;
  let content;
  const lesson = currentLesson();
  if (ui.page === "history") content = historyView(history);
  else if (ui.page === "about") content = aboutView();
  else if (!session || ui.studio) content = home(ui, lessons, session);
  else if (session.phase === "belief") content = beliefView(session, lesson);
  else if (session.phase === "answer") content = answerView(session, lesson);
  else if (session.phase === "review")
    content = reviewView(session, lesson, ui);
  else if (session.phase === "transfer")
    content = transferView(session, lesson);
  else content = summaryView(session, lesson, ui);
  if (ui.confirmNew)
    content += `<dialog id="new-session-dialog"><h2>${ui.pendingCardId ? "Open a saved card instead?" : "Start a fresh lesson?"}</h2><p>Your current unfinished session will be replaced. Completed learning cards stay in your browser.</p><div class="dialog-actions"><button class="button secondary" data-action="cancel-new">Keep my session</button><button class="button primary" data-action="confirm-new">${ui.pendingCardId ? "Open saved card" : "Start fresh"}</button></div></dialog>`;
  app.innerHTML = shell(content, ui, session, lesson, history);
  if (ui.confirmNew) document.querySelector("#new-session-dialog").showModal();
  bindInputs();
  if (focus) {
    document.querySelector("#main").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  } else {
    const replacement = focusedId
      ? document.getElementById(focusedId)
      : focusedTest
        ? document.querySelector(`[data-testid="${CSS.escape(focusedTest)}"]`)
        : null;
    replacement?.focus({ preventScroll: true });
    if (selection && replacement?.setSelectionRange)
      replacement.setSelectionRange(...selection);
  }
}

async function checkConnection() {
  if (ui.checking && reconnectAttempt > 0) return;
  const attempt = ++reconnectAttempt;
  ui.checking = true;
  render();
  try {
    const response = await fetch("/api/status", {
      signal: AbortSignal.timeout(6000),
    });
    const data = response.ok ? await response.json() : {};
    ui.available = data.available === true;
  } catch {
    ui.available = false;
  } finally {
    if (attempt === reconnectAttempt) {
      ui.checking = false;
      if (!session && !ui.modeChosen)
        ui.mode = ui.available ? "local-ai" : "reviewed";
      render();
    }
  }
}

function stopFeedback() {
  if (active) {
    active.controller.abort();
    active = null;
  }
  if (clock) clearInterval(clock);
  clock = null;
  ui.busy = false;
  ui.elapsed = 0;
}

async function askPip(revision = false) {
  stopFeedback();
  const source = session,
    index = source.step,
    response = source.responses[index];
  const answer = revision ? response.revision : response.answer;
  const request = { controller: new AbortController(), id: source.id, index };
  active = request;
  response.feedback = null;
  response.feedbackAnswer = answer;
  response.feedbackForRevision = revision;
  response.revising = revision;
  ui.busy = true;
  ui.elapsed = 0;
  ui.error = "";
  persistDraft();
  render();
  const started = Date.now();
  clock = setInterval(() => {
    ui.elapsed = Math.floor((Date.now() - started) / 1000);
    const node = document.querySelector("#request-time");
    if (node)
      node.textContent = `${ui.elapsed}s elapsed · explanation ready below`;
  }, 1000);
  try {
    const result = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.any([
        request.controller.signal,
        AbortSignal.timeout(48000),
      ]),
      body: JSON.stringify({
        action: "feedback",
        lessonId: source.lessonId,
        questionIndex: index,
        answer,
        attempt: response.attempt,
        initialExplanation: source.belief,
      }),
    });
    const data = await result.json();
    if (!result.ok)
      throw new Error(data.error || "Pip could not finish this review.");
    if (
      !["supported", "partial", "revisit"].includes(data.verdict) ||
      typeof data.feedback !== "string" ||
      data.feedback.length > 2000 ||
      data.criterionIndex !== index ||
      data.source !== "local-ai"
    )
      throw new Error("Pip returned feedback we could not verify.");
    if (
      active !== request ||
      session?.id !== request.id ||
      session.step !== index
    )
      return;
    response.feedback = data;
  } catch (error) {
    if (active !== request || request.controller.signal.aborted) return;
    ui.error =
      error.name === "TimeoutError"
        ? "Pip took too long to respond."
        : error.message === "Failed to fetch"
          ? "The local tutor is unreachable. Check Ollama or try the connection button."
          : error.message;
  } finally {
    if (active === request) {
      active = null;
      if (clock) clearInterval(clock);
      clock = null;
      ui.busy = false;
      persistDraft();
      render();
    }
  }
}

function saveCompleted() {
  const lesson = currentLesson(),
    result = resultSummary(session, lesson);
  const snapshot = structuredClone(session);
  snapshot.persisted = true;
  const entry = {
    id: session.id,
    title: lesson.title,
    lessonId: lesson.id,
    date: session.completedAt || new Date().toISOString(),
    mode: session.mode,
    confidence: session.confidence,
    finalConfidence: session.finalConfidence,
    passed: result.passed,
    transferPassed: result.transferPassed,
    session: snapshot,
  };
  const saved = appendHistory(local, entry);
  history = saved.history.filter(validHistory).map((item) =>
    item.id === entry.id
      ? {
          ...item,
          persisted: saved.ok,
          session: { ...snapshot, persisted: saved.ok },
        }
      : item,
  );
  session.persisted = saved.ok;
  if (!saved.ok) ui.storageWarning = saved.message;
  else ui.storageWarning = "";
  persistDraft();
}

function downloadCard() {
  const lesson = currentLesson(),
    result = resultSummary(session, lesson);
  const text = [
    "EXPLAINBACK — A BELIEF, REBUILT",
    lesson.title,
    `${session.mode === "local-ai" ? "Local GPT-OSS coaching" : "Reviewed lesson mode"} · A learning record, not a grade.`,
    "",
    `Confidence before: ${session.confidence}/5. After: ${session.finalConfidence}/5.`,
    `Quick checks: ${result.passed}/3. Transfer: ${result.transferPassed ? "correct" : "reviewed"}.`,
    "",
    "WHAT I THOUGHT",
    session.belief,
    ...lesson.steps.flatMap((step, index) => {
      const response = session.responses[index];
      return [
        "",
        `${index + 1}. ${step.title}`,
        "Question: " + lesson.questions[index],
        "My answer: " + response.answer,
        "Correct explanation: " + step.answer,
        "Why: " + step.why,
        "Example: " + step.workedExample,
        ...(response.feedback
          ? [
              "Pip reviewed this text: " +
                (response.feedbackAnswer || response.answer),
              "Pip: " + response.feedback.feedback,
              "Evidence from this answer: " + response.feedback.quote,
            ]
          : []),
        ...(response.revision ? ["My rewrite: " + response.revision] : []),
        "Quick check: " + step.checkpoint.explanation,
      ];
    }),
    "",
    "TRANSFER",
    lesson.transfer.question,
    lesson.transfer.explanation,
    "",
    "AI feedback is formative and can misinterpret an answer. Lesson content is prepared; consult course materials for authoritative guidance.",
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `explainback-${lesson.id}-learning-card.txt`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function beginNew() {
  stopFeedback();
  session = newSession(ui.selected, ui.mode);
  ui.studio = false;
  ui.page = "practice";
  ui.error = "";
  ui.restored = false;
  ui.lab = {};
  persistDraft();
  render(true);
}

function openCard(id) {
  const item = history.find((h) => h.id === id);
  if (
    item?.session &&
    sessionValid(
      item.session,
      lessons.map((l) => l.id),
    )
  ) {
    stopFeedback();
    session = structuredClone(item.session);
    ui.page = "practice";
    ui.studio = false;
    ui.error = "";
    render(true);
  }
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target || target.disabled) return;
  event.preventDefault();
  const action = target.dataset.action,
    value = target.dataset.value;
  if (action === "nav" || action === "home" || action === "back-studio") {
    ui.page = action === "nav" ? target.dataset.page : "practice";
    ui.studio = true;
    render(true);
    return;
  }
  if (action === "select-lesson") {
    ui.selected = value;
    render();
    return;
  }
  if (action === "mode") {
    if (value === "reviewed" || ui.available) {
      ui.mode = value;
      ui.modeChosen = true;
    }
    render();
    return;
  }
  if (action === "reconnect") {
    checkConnection();
    return;
  }
  if (action === "dismiss-restored") {
    ui.restored = false;
    render();
    return;
  }
  if (action === "start" || action === "new-session") {
    if (session && !session.completed && action === "new-session") {
      const dialog = document.querySelector("#new-session-dialog");
      if (dialog) dialog.showModal();
      else {
        ui.confirmNew = true;
        render();
      }
    } else beginNew();
    return;
  }
  if (action === "resume") {
    ui.studio = false;
    ui.page = "practice";
    render(true);
    return;
  }
  if (action === "confirm-new") {
    ui.confirmNew = false;
    if (ui.pendingCardId) {
      openCard(ui.pendingCardId);
      ui.pendingCardId = null;
    } else beginNew();
    return;
  }
  if (action === "cancel-new") {
    ui.confirmNew = false;
    ui.pendingCardId = null;
    render();
    return;
  }
  if (action === "clear-history") {
    if (removeStored(local, "explainback-history-v2")) history = [];
    else
      ui.storageWarning =
        "Browser storage could not be cleared. The saved cards may still be on this browser.";
    render();
    return;
  }
  if (action === "open-card") {
    if (session && !session.completed) {
      ui.pendingCardId = value;
      ui.confirmNew = true;
      render();
    } else openCard(value);
    return;
  }
  if (!session) return;
  const response = session.responses[session.step];
  if (action === "confidence" || action === "final-confidence") {
    session[action === "confidence" ? "confidence" : "finalConfidence"] =
      Number(value);
    persistDraft();
    render();
    return;
  }
  if (action === "sample") {
    session.belief = currentLesson().sample;
    persistDraft();
    render();
    document.querySelector("#belief-input")?.focus();
    return;
  }
  if (action === "skip-ai") {
    stopFeedback();
    ui.error = "";
    persistDraft();
    render();
    return;
  }
  if (action === "retry-feedback") {
    askPip(response.feedbackForRevision === true);
    return;
  }
  if (action === "checkpoint-option" && !response.checked) {
    response.choice = Number(value);
    persistDraft();
    render();
    return;
  }
  if (action === "check-understanding" && response.choice !== null) {
    response.checked = true;
    persistDraft();
    render();
    document
      .querySelector(".check-result")
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }
  if (action === "next-step") {
    if (!response.checked) return;
    stopFeedback();
    ui.error = "";
    ui.lab = {};
    advance(session);
    persistDraft();
    render(true);
    return;
  }
  if (action === "edit-answer") {
    stopFeedback();
    session.phase = "answer";
    ui.error = "";
    persistDraft();
    render(true);
    return;
  }
  if (action === "save-revision") {
    response.revised = true;
    persistDraft();
    target.textContent = "Rewrite kept ✓";
    return;
  }
  if (action === "lab-yield") {
    ui.lab.yielded = value === "true";
    renderLab();
    return;
  }
  if (action === "lab-streak") {
    ui.lab.flips = Math.min((ui.lab.flips || 0) + 1, 99);
    renderLab();
    return;
  }
  if (action === "lab-reset") {
    ui.lab.flips = 0;
    renderLab();
    return;
  }
  if (action === "lab-choice") {
    ui.lab.chosen = Number(value);
    renderLab();
    return;
  }
  if (action === "transfer-option" && !session.transferChecked) {
    session.transferChoice = Number(value);
    persistDraft();
    render();
    return;
  }
  if (action === "check-transfer" && session.transferChoice !== null) {
    session.transferChecked = true;
    persistDraft();
    render();
    return;
  }
  if (action === "finish-session") {
    if (!session.transferChecked) return;
    stopFeedback();
    session.completed = true;
    session.completedAt = new Date().toISOString();
    session.phase = "summary";
    ui.error = "";
    saveCompleted();
    render(true);
    return;
  }
  if (action === "retry-save") {
    saveCompleted();
    render();
    return;
  }
  if (action === "download") {
    downloadCard();
    return;
  }
  if (action === "finish") {
    stopFeedback();
    session = null;
    removeStored(draftStorage, draftKey);
    ui.studio = true;
    ui.restored = false;
    if (!ui.modeChosen) ui.mode = ui.available ? "local-ai" : "reviewed";
    render(true);
  }
});

function renderLab() {
  const panel = document.querySelector('[data-testid="prediction-lab"]');
  const focused = document.activeElement?.id;
  if (panel) panel.innerHTML = labView(session.lessonId, session.step, ui.lab);
  if (focused) document.getElementById(focused)?.focus({ preventScroll: true });
}

app.addEventListener("input", (event) => {
  if (!session) return;
  const input = event.target;
  input.setCustomValidity?.("");
  if (input.id === "belief-input") {
    session.belief = input.value;
    const count = document.querySelector("#belief-count");
    if (count) count.textContent = `${input.value.length}/4000`;
  }
  if (input.id === "answer-input") {
    session.responses[session.step].answer = input.value;
    const count = document.querySelector("#answer-count");
    if (count) count.textContent = `${input.value.length}/2000`;
  }
  if (input.id === "revision-input")
    session.responses[session.step].revision = input.value;
  if (input.dataset.lab) {
    ui.lab[input.dataset.lab] = Number(input.value);
    renderLab();
    return;
  }
  persistDraft();
});

function bindInputs() {
  document
    .querySelector("#belief-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.querySelector("#belief-input");
      if (input.value.trim().length < 20) {
        input.setCustomValidity(
          "Write at least 20 characters, even if you are unsure.",
        );
        input.reportValidity();
        return;
      }
      session.belief = input.value.trim();
      session.phase = "answer";
      ui.restored = false;
      persistDraft();
      render(true);
    });
  document
    .querySelector("#answer-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.querySelector("#answer-input");
      if (input.value.trim().length < 10) {
        input.setCustomValidity(
          "Write at least 10 characters so Pip has an idea to respond to.",
        );
        input.reportValidity();
        return;
      }
      const response = session.responses[session.step];
      response.answer = input.value.trim();
      response.feedback = null;
      response.checked = false;
      response.choice = null;
      session.phase = "review";
      ui.error = "";
      persistDraft();
      render(true);
      if (session.mode === "local-ai") askPip();
    });
  document
    .querySelector("#revision-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.querySelector("#revision-input"),
        response = session.responses[session.step];
      if (input.value.trim().length < 10) {
        input.setCustomValidity(
          "Write at least 10 characters for your rewrite.",
        );
        input.reportValidity();
        return;
      }
      if (response.attempt >= 3 || ui.busy) return;
      response.revision = input.value.trim();
      response.attempt++;
      response.revised = true;
      persistDraft();
      askPip(true);
    });
}

window.addEventListener("pagehide", () => {
  persistDraft();
  stopFeedback();
});
render();
checkConnection();
