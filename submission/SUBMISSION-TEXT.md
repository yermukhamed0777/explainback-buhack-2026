# ExplainBack — submission field text

Use the copy under each field in the final project form. Keep track and eligibility details accurate. The repository must contain the reviewed final implementation before the form is submitted.

## Project name

ExplainBack

## Tagline / short description

Bring a belief. Test it. Leave with a reason.

## Tracks

- Tertiary School Track
- EdTech

## About the project — paste the section below

### Inspiration

I can recognise a formula and still misunderstand what it means. In mechanics, it is easy to assume that a stiffer material must also be stronger. A fluent explanation—or a confident AI reply—can hide that mistake.

I built ExplainBack to make the correction visible. The student records a belief, predicts what will happen, explores a counterexample, and explains the relationship again.

### What it does

The flagship Misconception Lab turns one mechanics belief into a focused investigation:

1. Capture an explanation and a self-reported confidence rating.
2. Confirm a prepared investigation suggested by transparent local topic matching.
3. Make a prediction before the result is revealed.
4. Manipulate a reviewed experiment and see the reasoning.
5. Explain the idea in the student's own words. Pip, the local AI classmate, gives qualitative feedback on that answer.
6. Complete an independent quick check and a different transfer case.
7. Keep a before/after learning card with the belief, prediction, optional rewrite, and observed check results.

The stiffness experiment uses fictional rods of equal dimensions. Material A has twice B's Young's modulus but a lower failure limit. At 2,000 N, A has reached its limit while B remains intact. Each force setting represents fresh specimens; the calculation stops the elastic response at failure.

The prototype also includes full guided lessons on stress and strain, independent events, and opportunity cost. No account is required.

### How I built it

The interface uses HTML, CSS, and JavaScript modules. A Node.js server calls GPT-OSS 20B through Ollama using the Vercel AI SDK and an OpenAI-compatible local endpoint.

The model handles short, answer-specific language feedback. Reviewed explanations, material calculations, quick-check answers, and transfer logic are separate from the model. If inference is slow or unavailable, the student can still see the answer and complete the lesson in guided mode.

The local server binds to loopback, validates requests, limits inference resources, and escapes student and model text. Pip has no terminal or file tools. Drafts and completed cards use browser storage when available, with visible save failures and a download option.

### What makes it useful

ExplainBack connects an initial belief to an observable counterexample and a new application. It gives the student something to inspect and explain, rather than treating a conversation or a confidence rating as proof of understanding.

The intended use is a short study session or tutorial: identify one shaky distinction, work through its consequences, and keep a record of the correction. A tutor can use the same card to discuss the student's reasoning.

### Challenges and decisions

An early version asked several questions without making the teaching and next step clear enough. I changed the flow so each answer leads to an immediate reviewed explanation, and the flagship investigation follows the selected belief directly.

I also separated quoted evidence from claims of correctness. A located excerpt proves which words the model reviewed; it does not prove the model interpreted them correctly. Confidence and objective checks are displayed separately.

### What I learned

A learning tool needs a clear recovery path as much as an AI response. Slow inference, a wrong answer, or a failed save should not strand the student. A small local model is more useful when its task is narrow and the underlying teaching logic remains inspectable.

### What's next

I want to test the prototype with students and tutors, including a delayed transfer question to see whether the correction lasts. Further work includes teacher-reviewed investigation packs and better feedback evaluation. The current prototype does not claim proven learning gains or general mastery assessment.

### AI use

GPT-OSS 20B supplies local qualitative coaching. Hermes with GPT-OSS assisted development of the material calculation module and its initial tests; those outputs were reviewed and corrected before integration. ChatGPT/Codex assisted implementation, review, testing, and documentation. AI feedback remains separate from the authored teaching and checks.

### Running the demo

The public repository contains setup instructions. The local app supports both Ollama coaching and a model-free guided mode. A hosted static preview, if provided, supports guided mode only; it cannot call the model on my computer.

## GitHub repository link

https://github.com/yermukhamed0777/explainback-buhack-2026

## Project demo link

Use a verified, judge-accessible public guided-demo URL if one is published. Otherwise use the repository link above and explain that the video demonstrates the local deployment, which the official event requirements allow. **Do not paste http://127.0.0.1:4173 into the submission form:** that address points to each visitor's own computer.

The current ChatGPT-hosted preview is restricted and is not a suitable judge-facing link until its access and final version have been reviewed and changed deliberately.

## Short demo video

Paste the uploaded YouTube, Vimeo, or Youku URL after recording. Follow [VIDEO-SCRIPT.md](VIDEO-SCRIPT.md), export below three minutes, and check signed-out playback. A script file is not a substitute for this video link.

## Built with

JavaScript, HTML, CSS, Node.js, Ollama, GPT-OSS 20B, Vercel AI SDK, Hermes, ChatGPT/Codex, Playwright, Node Test Runner, GitHub Actions

If the form accepts technology tags individually, add the available equivalents. Vercel AI SDK is a library used locally; this does not mean the project is deployed on Vercel.

## GenAI tools used

Select OpenAI for ChatGPT/Codex and GPT-OSS where the form offers that category. If there is an Other field, enter **GPT-OSS 20B via Ollama; Hermes**. Include GitHub Copilot only if you actually used it on this project, and select its appropriate option. Do not select providers merely because they appear in the list.

## Technology feedback — optional

Local GPT-OSS made it possible to prototype answer-specific coaching without sending student text to an external model service. The harder part was keeping the learning flow clear when inference was slow or the model interpreted an answer imperfectly. Narrow context, checked excerpts, reviewed explanations, and deterministic checks helped make those limits visible.

## Additional materials — optional

Use the final GitHub links to this submission script and the README after the documents are pushed. The form shown does not establish that a slide deck or separate PDF is required. Upload those only if the current form or organizer instructions ask for them.

## Team / eligibility note — only if requested

Solo tertiary participant; solo participation approved by the organizers. Keep the approval available if asked. Do not invent teammates or include private organizer correspondence in the public repository.
