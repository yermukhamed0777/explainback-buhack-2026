# ExplainBack

**Bring a belief. Leave with a reason.**

ExplainBack is an EdTech learning workbench built for BUHack 2.0, Tertiary School Track. Solo participation was approved by the organizers. The repository was created during the hackathon.

The problem: a student can feel familiar with a concept without being able to explain it. Simply asking more questions does not close that gap. ExplainBack makes the correction part of the experience.

## The learning loop

1. **Believe:** capture an explanation and a confidence rating.
2. **Test:** answer one reviewed question in your own words.
3. **Understand:** immediately see the correct explanation, reasoning, worked example, and common trap. Local AI adds short feedback on the actual answer alongside this content.
4. **Rebuild:** manipulate a counterexample lab, complete a new quick check, and optionally rewrite the explanation.
5. **Apply:** solve a transfer case and save a before/after learning card.

The core teaching path does **not wait for AI**. A slow or failed model request never hides the reviewed answer, blocks the quick check, or prevents completing the lesson. Wrong quick-check answers reveal the reasoning and still allow progress. The app has three prepared lessons: stress and strain, independent events, and opportunity cost.

## Run the live local demo

Requires Node.js 22+ and npm. For local AI, run Ollama with `gpt-oss:20b` installed.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4173**. The sidebar reports the connection and offers a retry without reloading. Choose **Local AI** or **Guided demo** before starting. Guided demo needs no model.

Default inference endpoint: `http://127.0.0.1:11434/v1`. `LOCAL_AI_BASE_URL` and `LOCAL_AI_MODEL` can select a different loopback-compatible service/model. Only loopback HTTP inference is accepted. ExplainBack does not start, download, or reconfigure Ollama or Hermes. It uses the same local model service alongside Hermes, without invoking the agent's tools.

## A short demo story

Choose **Stress & strain**, try the sample misconception, and rate confidence high. For the first question, explain why unchanged force would mean unchanged stress. The reviewed answer immediately shows why area matters; Pip can point out the missing relationship. Move the area slider from 1 to 2 cm²: the same 100 N pull now produces half the stress.

Complete the quick check, then test stiffness versus strength and permanent deformation after yield. Rewrite an explanation to capture the correction. Finish the transfer case and download the learning card. It records what you initially thought, the reviewed reasoning, optional rewrites, objective check results, and self-reported confidence.

This combines local, answer-specific coaching with reviewed teaching and interactive counterexamples. We do not claim that the idea is impossible to replicate or that a small model can reliably grade understanding.

## How local AI is used

Pip sends **one answer and its specific question/criterion** to GPT-OSS for short qualitative feedback. It returns `supported`, `partial`, or `revisit`, plus a helpful explanation and optional quote from that answer. There is no numerical AI grade.

Evidence is scoped to the current answer. A quote from another response cannot support it. A missing or fabricated support quote downgrades the response and produces a visible warning, rather than breaking the lesson. Finding a quote proves that it exists, not that the model's interpretation is correct. The reviewed answer and objective checks remain independent of the model.

GPT-OSS also assisted development. A bounded coding review recommended dynamic lesson bounds, explicit warnings for evidence downgrades, clear evidence provenance, and avoiding answer-content logs. Those suggestions were reviewed and incorporated. The model was not given filesystem, terminal, or deployment tools.

## Reliability, privacy, and security

- Drafts are kept in this tab's session storage and restored after reload. No inference is automatically restarted on reload.
- Completed learning cards, including explanations, are stored on this browser when storage is available. Failures are shown honestly; download remains available. No cloud account or analytics is used.
- The local web server binds only to `127.0.0.1`. Host, Origin, and browser cross-site checks constrain other websites. Pip has no tools or file access.
- JSON bodies and inference have deadlines and size bounds. Status checks are cached and coalesced. Model requests are serialized and rate limited. Cancellation reaches inference.
- AI/student text is escaped. A content security policy restricts scripts to the app; fonts are bundled locally with licenses. Inline styles are allowed for the interactive diagrams.

These controls are for a local demo. They do not make it suitable for a public tunnel or multi-user service. A public live-AI deployment needs a separately designed backend and reachable inference service.

## Verification

```sh
npm test
npm run check
```

Unit/API tests cover teaching content, state transitions, corrupted drafts, failed storage, scoped evidence, cancellation, request deadlines, resource limits, and local-only controls. `check` runs syntax validation, ESLint, and formatting checks.

The deterministic browser suite uses a local fixture tutor, so it does not depend on Ollama speed or model output:

```sh
npx playwright install chromium
npm run test:e2e
```

It covers desktop/mobile guided and live flows, instant explanations during slow inference, retry/cancel, wrong-answer progression, draft restore, blocked storage, escaped model text, and reconnect. GitHub Actions runs these checks on pushes.

Real-model verification is separate and opt-in. In PowerShell:

```powershell
$env:RUN_LOCAL_AI_SMOKE = '1'
node --test tests/coach.test.js
```

During development, real GPT-OSS feedback on a vague stress answer identified the missing area relationship; a correct answer received a located quote. Observed short smoke-test calls took roughly 4–6 seconds; browser calls were sometimes substantially slower. The reviewed explanation appears immediately, and local feedback has a 45-second inference deadline. Timing and educational quality remain model- and hardware-dependent; fixture tests do not establish general assessment accuracy.

## Architecture and hosting

- `dist/app.js`: events, networking, request lifecycle, and session orchestration.
- `dist/views.js`, `components.js`, `styles.css`: accessible, responsive interface.
- `dist/lessons.js`: reviewed teaching, worked examples, and checks.
- `dist/session.js`, `storage.js`: testable state and persistence boundaries.
- `dist/labs.js`: interactive illustrative counterexamples and calculations.
- `scripts/coach.mjs`: structured local feedback and evidence validation.
- `scripts/serve.mjs`: loopback static server and same-origin API.

The `dist` folder also works as a standalone static website. The hosted preview provides **guided lessons only**. It cannot call this computer's local model. There is no build step and no provider secret in browser code.

Protocol reference: [Ollama OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility). The integration uses the version-matched documentation bundled with the installed AI SDK.
