# ExplainBack

**Turn false confidence into demonstrated understanding.**

Built during BUHack 2.0 (13–15 November 2026), Tertiary School Track / EdTech. Solo participation approved by the organizers.

Students rate their confidence, teach a concept in their own words, answer three probing questions, review evidence against lesson criteria, and solve a transfer question.

## Run locally

Requires Node.js 22+. No paid API key is needed.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. With Ollama serving `gpt-oss:20b`, the app detects the model and starts in **Live AI · local** mode. Use the mode button before a session to choose offline practice instead. Run `npm test` and `npm run check` to verify the feedback engines, local API, and JavaScript.

The default local model endpoint is `http://127.0.0.1:11434/v1`. Optional process environment variables `LOCAL_AI_BASE_URL` and `LOCAL_AI_MODEL` select another loopback OpenAI-compatible service and model. Remote endpoints are rejected in this local-only integration. Start Ollama separately; ExplainBack does not download models or change Hermes/Ollama settings.

Hermes can keep running alongside the app. ExplainBack calls the same local GPT-OSS inference service directly; it does not invoke Hermes's terminal agent or its tools.

## Prototype scope

This version has two explicitly labelled modes. **Live local AI** generates three adaptive questions and a report grounded in prepared lesson notes. Reports compare initial and final coverage, include model feedback, and show quotations checked against the student's responses. **Offline demo** uses authored questions, phrase checks, and misconception patterns. Coverage in either mode is an approximate formative signal, not a grade or validated measure of understanding. AI can misjudge an explanation, and phrase checks can miss correct wording. The prepared multiple-choice transfer check is scored independently.

No accounts, uploads, or analytics. Live mode sends lesson notes and responses only to the local model service on this computer; the browser does not call Ollama directly. The app server binds to loopback and rejects cross-site requests. Fonts are bundled locally with their open-source licenses. Session progress lives in memory; only finished session summaries are saved in this browser's local storage if available. The app includes a clear-history action. Refreshing an unfinished session starts over.

Each follow-up targets one rubric criterion. In live mode the final report reviews the conversation with later corrections taking priority; offline mode checks each corresponding answer. The report compares initial confidence with initial coverage and separately shows coverage after follow-up answers. If a model call fails, answers are preserved for a retry or an explicit switch to offline mode. Requests can be cancelled; the app never silently substitutes offline feedback for an AI result.

## Try the demo

1. Choose **Stress & strain** and confidence **5**.
2. Start explaining and choose **Try a misconception example**.
3. Answer the follow-ups in your own words. You can refer to the notes.
4. Compare your initial coverage with the criteria covered after your answers.
5. Complete the transfer check, download the report, and visit **My progress**.

## Verification

Automated tests cover correct explanations across all lessons, explicit misconceptions, later corrections, input limits, generated report validation, fabricated evidence, local-only configuration, and cross-site request rejection. JavaScript syntax checks are available through `npm run check`.

The original offline flow was checked from confidence selection through the transfer answer and saved history. Mobile layout was checked at a 390 px viewport with no horizontal overflow. Live model calls and the browser tutoring journey are also exercised during development; generation is nondeterministic and its accuracy is not validated by the automated fixtures.

The live GPT-OSS mechanics journey was verified through three questions, the report with matching student quotations, and the transfer check. Eighteen automated tests pass, including cancellation propagation and single-request handling.

Observed model limitations: a generated question initially repeated a false premise, so prompts now anchor to reviewed questions and require self-contained scenarios. The model also sometimes overcredits a vague initial definition. Quote validation proves that an excerpt exists in the student's text, not that the model interpreted it correctly. An invalid quote rejects the report with a retry option; it is not silently displayed or replaced with an offline estimate.

## Architecture

- `dist/index.html`: accessible application shell.
- `dist/styles.css`: responsive visual system.
- `dist/lessons.js`: authored notes, questions, rubric patterns, and transfer tasks.
- `dist/engine.js`: pure evaluation and confidence calibration functions.
- `dist/app.js`: session flow, reporting, browser-local history, and text report export.
- `scripts/serve.mjs`: local web server and validated, same-origin coaching API.
- `scripts/coach.mjs`: AI SDK integration with Ollama's compatible API, structured output, timeouts, and quote validation.

The `dist` directory is a standalone static website, suitable for static hosting. No build step is required. On static hosting it offers **offline practice only**; its server-side local model connection exists only when running the local app.

## Hosting live AI

The published static preview cannot reach this computer's localhost. A public live-AI demo needs a hosted backend with a reachable inference service, or a separately authorized secure tunnel and access controls. No tunnel or internet exposure is configured by this project. Keep any future provider credentials server-side.

Protocol reference: [Ollama OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility). AI SDK use follows the docs bundled with the installed package version.
