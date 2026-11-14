# Misconception Lab milestone: review handoff

## Result

A student can bring a stiffness/strength belief, confirm a prepared investigation, record a prediction before seeing the material limits, explore a physically consistent counterexample, explain the distinction, and complete a different transfer case. The learning card preserves the belief, prediction, reviewed outcome, optional rewrite, and check results.

The three-question mechanics lesson remains available through **Explore all three ideas**. Probability and economics retain their existing full-lesson format. Unsupported beliefs offer explicit prepared choices; the topic suggestion is local keyword matching, not an AI diagnosis.

## What Hermes actually did

Hermes ran with the local `gpt-oss:20b` model and file tools only. It wrote `dist/materials.js` and the initial `tests/materials.test.js`. Review corrected strict modulus validation and an invalid extra-argument assertion, added calculation and immutability checks, and independently ran the suite. Hermes did not run Git, commit, push, or publish in this bounded task.

The rest of the integration was implemented and reviewed in the main workspace. Pip's tutoring endpoint has no file or terminal tools. Its qualitative feedback remains separate from the reviewed answers and objective checks.

## Verification on November 14, 2026

| Check                     | Observed result                                                                                                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                | **55 passed, 0 failed, 1 skipped**. The skipped test is the opt-in real-model smoke test.                                                                                                                               |
| `npm run check`           | JavaScript syntax, ESLint, and Prettier pass.                                                                                                                                                                           |
| Real GPT-OSS browser flow | A correct stiffness explanation received local AI feedback with an excerpt from that answer; the focused session reached a saved card with 1/1 quick checks and the transfer applied.                                   |
| Prediction disclosure     | The stiffness strength limits and result are hidden until a choice is made and **Test my prediction** is pressed.                                                                                                       |
| Calculation at 2,000 N    | A reaches its failure limit; B remains intact with 2.00 mm extension. No elastic extension is shown for failed A.                                                                                                       |
| Draft recovery            | A selected yield prediction survived reload without revealing the result early. Revealing it showed permanent plastic strain.                                                                                           |
| Wrong-answer progression  | A wrong yield answer showed the reviewed correction. A wrong quick check showed the correct reasoning and enabled progress to the yield transfer case.                                                                  |
| Full-lesson regression    | All three reviewed mechanics explanations appeared; all three checks progressed to the original transfer case, whose checked answer enabled completion. This manual regression stopped before saving another test card. |
| Mobile layout             | Prediction and counterexample controls worked at 390 × 844. The page did not overflow horizontally; the A/B results remained readable. The temporary viewport override was reset.                                       |
| Browser errors            | No error-level console messages were observed in the tested flagship and full-lesson tabs.                                                                                                                              |

The new desktop/mobile Playwright specification is prepared in `tests/e2e/investigations.spec.js`; the existing learning suite was adjusted to choose the full-lesson alternative. **The 24-case automated browser suite has not been executed on this uncommitted milestone.** Manual browser checks above are separate evidence, not a claim that those 24 cases passed.

An initial sandboxed API-test attempt could not complete the loopback checks. The suite was rerun with permission to create temporary local HTTP servers and passed; that successful run supplies the count above.

Browser testing used separate tabs. The user's original unfinished session was preserved. One completed flagship example card was added to browser-local history.

## Corrections made during review

- Focused sessions advance after their single check and use a concept-specific transfer question and denominator, instead of reporting three attempted ideas.
- The saved card and download use the selected criterion and preserve the prediction.
- Model requests reject investigation context for a different question or lesson. The stiffness context includes the fictional material values and the no-extension-after-failure rule.
- A yield investigation opens its lab past yield, including after reload, so the initial illustration matches the question. The area investigation opens at doubled area.
- History accepts only the supported one- or three-check totals.

## Review and submission boundary

At the November 14 review handoff, changes were local and uncommitted. On November 15 the participant approved committing and pushing the finalized source and submission package. The restricted hosted preview has not been updated or made public; use the public repository for the submitted local demo.

Try the local app at http://127.0.0.1:4173 and follow [DEMO.md](DEMO.md). For independent Copilot QA, run `npm test`, `npm run check`, and `npm run test:e2e`, then review the results and diff before committing and pushing.

The public static preview supports guided lessons. It cannot reach this computer's Ollama service. A live-AI public service is outside this local milestone. The submission still needs the final reviewed commit/public demo update and a video link of at most five minutes.

The fictional material model is deliberately linear elastic to a failure threshold. It is not a real stress-strain dataset or a full plasticity/fracture simulation. AI feedback can misinterpret an answer; a located quote establishes provenance, not assessment accuracy. No learning-effectiveness or uniqueness claim has been established by these checks.

## Final submission review — November 15, 2026

The final audit found and fixed three additional issues: edited answers now share the three-review allowance with rewrites; malformed optional feedback snapshots/flags are rejected during draft recovery; and the material lab explicitly says each force setting tests fresh rods rather than a loading/unloading history.

`npm test` on this source passed **60 tests with 0 failures and 1 optional real-model smoke test skipped**. `npm run check` passed for 27 JavaScript files, ESLint, and Prettier. The browser specifications now contain 26 desktop/mobile cases. They were not run through local browser automation during this review; GitHub Actions is configured to run the full suite on push. Check the [latest CI runs](https://github.com/yermukhamed0777/explainback-buhack-2026/actions) for the final commit's result.

Manual browser verification against the deterministic local tutor confirmed failure → explicit retry, two further edited-answer reviews, denial of a fourth new round without a retry bypass, persistence of that limit after reload, and continued progression through the reviewed quick check. This is fixture evidence, separate from real-model verification.

The exact video input was also rehearsed against the real local model. The first inference failed visibly; explicit retry returned relevant supported feedback with a located excerpt from that answer. A separate diagnostic call succeeded in about 27 seconds. The rehearsal then completed its quick check, saved an optional rewrite without another inference call, answered the different P/Q transfer case, and saved the card. Model latency and output remain variable; this is not a claim of failure-free inference. The screenshot in `submission/assets/local-ai-feedback.jpg` is from the actual successful response.

The video narration, screen cues, project description, and judge checklist are in `submission/`. Fresh official rules require a video **under three minutes**, with a November 15, 10:00 AM HKT deadline. The script targets 2:40–2:50. Local deployments are explicitly accepted. The restricted hosted preview is not presented as a judge-accessible public demo.
