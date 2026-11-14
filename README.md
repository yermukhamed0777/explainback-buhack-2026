# ExplainBack

**Turn false confidence into demonstrated understanding.**

Built during BUHack 2.0 (13–15 November 2026), Tertiary School Track / EdTech. Solo participation approved by the organizers.

Students rate their confidence, teach a concept in their own words, answer three probing questions, review evidence against lesson criteria, and solve a transfer question.

## Run locally

Requires Node.js 20+. No packages or API key needed.

```sh
npm run dev
```

Open http://localhost:4173. Run `npm test` and `npm run check` to verify the feedback engine and JavaScript.

## Prototype scope

This version is an **offline, rule-based prototype**, not live AI. Questions are authored for three prepared lessons; feedback uses explicit phrase checks and misconception patterns. Coverage is an approximate formative signal, not a grade or validated measure of understanding. A correct explanation phrased differently can be missed; contradictory or nuanced statements may be misread. Every report exposes the criteria and source notes so students can inspect the result. The transfer check is scored independently.

No accounts, uploads, analytics, package dependencies, or external API calls. Fonts are bundled locally with their open-source licenses. Session progress lives in memory; only finished session summaries are saved in this browser's local storage if available. The app includes a clear-history action. Refreshing an unfinished session starts over.

Each follow-up targets one rubric criterion. Its answer replaces the initial explanation as evidence for that criterion, so correcting a misconception counts as progress. The report compares initial confidence with initial coverage and separately shows coverage after follow-up answers.

## Try the demo

1. Choose **Stress & strain** and confidence **5**.
2. Start explaining and choose **Try a misconception example**.
3. Answer the follow-ups in your own words. You can refer to the notes.
4. Compare your initial coverage with the criteria covered after your answers.
5. Complete the transfer check, download the report, and visit **My progress**.

## Verification

Eight automated tests cover correct explanations across all lessons, explicit misconceptions, later corrections, empty responses, confidence gaps, and lesson completeness. JavaScript syntax checks pass.

Browser verification covered the mechanics lesson from confidence selection through the transfer answer and saved history. Mobile layout was checked at a 390 px viewport with no horizontal overflow. Feedback remains heuristic and unvalidated; correct phrasing outside the prepared patterns can still be missed.

## Architecture

- `dist/index.html`: accessible application shell.
- `dist/styles.css`: responsive visual system.
- `dist/lessons.js`: authored notes, questions, rubric patterns, and transfer tasks.
- `dist/engine.js`: pure evaluation and confidence calibration functions.
- `dist/app.js`: session flow, reporting, browser-local history, and text report export.
- `scripts/serve.mjs`: dependency-free local preview server.

The `dist` directory is a standalone static website, suitable for static hosting. No build step is required.

## Next step: live coaching

Replace authored follow-up selection with a secure server-side model call grounded in the lesson notes. Keep API credentials server-side, validate structured responses, and keep the offline mode visibly distinct. Do not put API keys in the browser.
