import { test, expect } from "@playwright/test";

const belief =
  "A steeper stress–strain slope always means a stronger material.";
const checkpointAnswers = [1, 2, 1];
const answers = [
  "Stress is force divided by original area, so doubling area halves stress at fixed force.",
  "A steeper initial slope means greater stiffness, which does not establish greater breaking strength.",
  "After yield, unloading recovers elastic deformation but permanent plastic strain remains.",
];

async function begin(page, mode = "reviewed") {
  await page.goto("/");
  await page.getByTestId("lesson-stress").click();
  // The fixture is available. Wait for its initial status result before the
  // test deliberately selects a mode; reconnect behavior has its own case.
  await expect(page.getByTestId("mode-ai")).toBeEnabled();
  const control = page.getByTestId(
    mode === "local-ai" ? "mode-ai" : "mode-reviewed",
  );
  await expect(control).toBeEnabled();
  await control.click();
  await page.getByTestId("start-session").click();
  await page.getByTestId("belief-input").fill(belief);
  await page.getByTestId("begin-practice").click();
  await expect(page.getByTestId("answer-input")).toBeVisible();
}

async function answerAndCheck(page, index, answer = answers[index]) {
  await page.getByTestId("answer-input").fill(answer);
  await page.getByTestId("submit-answer").click();
  await expect(page.getByTestId("canonical-answer")).toBeVisible();
  await page
    .getByTestId(`checkpoint-option-${checkpointAnswers[index]}`)
    .click();
  await page.getByTestId("check-understanding").click();
  await expect(page.getByTestId("next-step")).toBeEnabled();
}

test("guided practice teaches after every answer and completes all checks and the transfer", async ({
  page,
}) => {
  await begin(page);
  for (let index = 0; index < 3; index++) {
    await answerAndCheck(page, index);
    await page.getByTestId("next-step").click();
  }
  await page.getByTestId("transfer-option-1").click();
  await page.getByTestId("check-transfer").click();
  await expect(page.getByTestId("finish-session")).toBeEnabled();
  await page.getByTestId("finish-session").click();
  await expect(page.getByTestId("summary")).toBeVisible();
  await expect(page.getByTestId("summary")).toContainText(/stress|strain/i);
  await page
    .getByRole("button", { name: "Explore another concept", exact: true })
    .click();
  await expect(page.getByTestId("mode-reviewed")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("mode-ai")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("live feedback arrives without hiding the correct lesson answer", async ({
  page,
}) => {
  await begin(page, "local-ai");
  await page.getByTestId("answer-input").fill(answers[0]);
  await page.getByTestId("submit-answer").click();
  await expect(page.getByTestId("canonical-answer")).toBeVisible();
  await expect(page.getByTestId("feedback-card")).toContainText(
    "Compare your reasoning",
  );
  await expect(page.getByTestId("feedback-card")).toContainText(answers[0]);
});

test("a full live-coached session reaches its learning card after the final answer", async ({
  page,
}) => {
  await begin(page, "local-ai");
  for (let index = 0; index < 3; index++) {
    await answerAndCheck(page, index);
    await expect(page.getByTestId("feedback-card")).toContainText(
      answers[index],
    );
    await page.getByTestId("next-step").click();
  }
  await page.getByTestId("transfer-option-1").click();
  await page.getByTestId("check-transfer").click();
  await page.getByTestId("finish-session").click();
  await expect(page.getByTestId("summary")).toBeVisible();
  await expect(page.getByTestId("summary")).toContainText("Local AI coaching");
  await expect(page.getByTestId("summary")).toContainText(
    "Learning card saved on this browser.",
  );
});

test("a failed live request retains the answer and supports an explicit retry", async ({
  page,
}, testInfo) => {
  await begin(page, "local-ai");
  const answer = `[fail-once] ${testInfo.project.name}/${testInfo.retry}: ${answers[0]}`;
  await page.getByTestId("answer-input").fill(answer);
  await page.getByTestId("submit-answer").click();
  await expect(page.getByTestId("canonical-answer")).toBeVisible();
  await expect(page.getByTestId("feedback-retry")).toBeVisible();
  await page.getByTestId("feedback-retry").click();
  await expect(page.getByTestId("feedback-card")).toContainText(
    "Compare your reasoning",
  );
  await expect(page.getByTestId("feedback-card")).toContainText("[fail-once]");
});

test("slow AI can be skipped while the reviewed answer and progress stay usable", async ({
  page,
}) => {
  await begin(page, "local-ai");
  await page.getByTestId("answer-input").fill(`[slow] ${answers[0]}`);
  await page.getByTestId("submit-answer").click();
  await expect(page.getByTestId("canonical-answer")).toBeVisible({
    timeout: 1000,
  });
  await page.getByTestId("skip-ai").click();
  await expect(page.getByTestId("canonical-answer")).toBeVisible();
  await page.getByTestId("checkpoint-option-1").click();
  await page.getByTestId("check-understanding").click();
  await page.getByTestId("next-step").click();
  await expect(page.getByTestId("answer-input")).toBeVisible();
});

test("a wrong checkpoint reveals the explanation and still lets the learner continue", async ({
  page,
}) => {
  await begin(page);
  await page.getByTestId("answer-input").fill(answers[0]);
  await page.getByTestId("submit-answer").click();
  await page.getByTestId("checkpoint-option-0").click();
  await page.getByTestId("check-understanding").click();
  await expect(page.getByTestId("canonical-answer")).toBeVisible();
  await expect(
    page.getByText(
      "200 N ÷ 20 mm² = 10 N/mm² = 10 MPa. Use force divided by area, not force multiplied by area.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByTestId("next-step")).toBeEnabled();
});

test("blocked browser storage does not make completion claim that progress was saved", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new Error("Storage blocked by test");
    };
  });
  await begin(page);
  for (let index = 0; index < 3; index++) {
    await answerAndCheck(page, index);
    await page.getByTestId("next-step").click();
  }
  await page.getByTestId("transfer-option-1").click();
  await page.getByTestId("check-transfer").click();
  await page.getByTestId("finish-session").click();
  await expect(page.getByTestId("summary")).toBeVisible();
  await expect(page.getByTestId("summary")).toContainText(
    /not saved|unavailable|kept on this page/i,
  );
  await page.getByRole("button", { name: /^Learning cards/ }).click();
  await expect(page.getByText("Not saved", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Open card/ }).click();
  await expect(page.getByTestId("summary")).toBeVisible();
  await expect(page.getByTestId("summary")).toContainText(
    "This card is not saved to browser storage.",
  );
});

test("an in-progress draft restores after a reload", async ({ page }) => {
  await begin(page);
  const answer =
    "I am still working through how force and cross-sectional area relate.";
  await page.getByTestId("answer-input").fill(answer);
  await page.reload();
  await expect(page.getByTestId("answer-input")).toHaveValue(answer);
});

test("model HTML-like content is displayed as text rather than inserted into the document", async ({
  page,
}) => {
  await begin(page, "local-ai");
  await page.getByTestId("answer-input").fill(`[escape] ${answers[0]}`);
  await page.getByTestId("submit-answer").click();
  const feedback = page.getByTestId("feedback-card");
  await expect(feedback).toContainText('<img src=x onerror=alert("model")>');
  await expect(feedback.locator("img,script")).toHaveCount(0);
});

test("a tutor started after page load can be reconnected without losing the page", async ({
  page,
}) => {
  let checks = 0;
  await page.route("**/api/status", async (route) => {
    checks++;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        available: checks > 1,
        model: "deterministic-test-tutor",
      }),
    });
  });
  await page.goto("/");
  await expect(page.getByTestId("mode-reviewed")).toBeEnabled();
  await expect(page.getByTestId("mode-ai")).toBeDisabled();
  await page.getByTestId("reconnect-ai").click();
  await expect(page.getByTestId("mode-ai")).toBeEnabled();
  expect(checks).toBeGreaterThan(1);
});
