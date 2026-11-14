import { test, expect } from "@playwright/test";

async function route(page, belief) {
  await page.goto("/");
  await expect(page.getByTestId("mode-ai")).toBeEnabled();
  await page.getByTestId("mode-reviewed").click();
  await page.getByTestId("start-session").click();
  await page.getByTestId("belief-input").fill(belief);
  await page.getByTestId("begin-practice").click();
}

test("a stiffness belief goes straight to a prediction and a physically consistent counterexample", async ({
  page,
}) => {
  await route(page, "I think a stiffer material must always be stronger.");
  await expect(page.getByTestId("investigation-stiffness")).toHaveClass(
    /recommended/,
  );
  await page.getByTestId("investigation-stiffness").click();
  await expect(page.getByTestId("prediction-card")).toBeVisible();
  await expect(page.getByTestId("investigation-evidence")).toHaveCount(0);
  await expect(
    page.getByText("Failure limit = 150 MPa", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByTestId("reveal-prediction")).toBeDisabled();
  await page.getByTestId("prediction-option-0").click();
  await page.getByTestId("reveal-prediction").click();
  await expect(page.getByTestId("investigation-evidence")).toBeVisible();
  await page.getByRole("button", { name: "2,000 N", exact: true }).click();
  await expect(page.locator(".material-result").nth(0)).toContainText(
    "Failure limit reached",
  );
  await expect(page.locator(".material-result").nth(1)).toContainText(
    "Intact · 2.00 mm extension",
  );
  await expect(
    page.getByText(
      "If you double the cross-sectional area while keeping the force the same, what happens to stress? Why?",
      { exact: true },
    ),
  ).toHaveCount(0);
  await page
    .getByTestId("answer-input")
    .fill(
      "Stiffness measures the initial elastic slope. Material A can be stiffer but fail at a smaller force because strength is a different limit.",
    );
  await page.getByTestId("submit-answer").click();
  await page.getByTestId("checkpoint-option-2").click();
  await page.getByTestId("check-understanding").click();
  await page.getByTestId("next-step").click();
  await expect(page.getByText(/P: E = 180 GPa/)).toBeVisible();
  await page.getByTestId("transfer-option-1").click();
  await page.getByTestId("check-transfer").click();
  await expect(
    page.getByText(/Each rod has engineering stress 1,800/),
  ).toBeVisible();
  await page.getByTestId("finish-session").click();
  const summary = page.getByTestId("summary");
  await expect(summary).toContainText("/ 1 correct");
  await expect(summary).toContainText("A must have the higher failure load");
  await expect(summary).toContainText(
    "A is stiffer but reaches its failure limit first",
  );
});

test("an ambiguous or unsupported belief offers choices without inventing a diagnosis", async ({
  page,
}) => {
  await route(page, "I want to learn how plants turn sunlight into food.");
  await expect(page.locator(".investigation-card.recommended")).toHaveCount(0);
  await expect(
    page.getByText(/outside these prepared investigations/),
  ).toBeVisible();
  await page.getByTestId("investigation-yield").click();
  await page.getByTestId("prediction-option-1").click();
  await page.reload();
  await expect(page.getByTestId("prediction-option-1")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("investigation-evidence")).toHaveCount(0);
  await page.getByTestId("reveal-prediction").click();
  await expect(
    page.getByText(/removing the load does not undo all deformation/),
  ).toBeVisible();
  await expect(
    page.getByText("A permanent change remains", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("A permanent change remains", { exact: true }),
  ).toBeVisible();
});
