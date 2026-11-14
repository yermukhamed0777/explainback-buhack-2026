# ExplainBack — recording script

Target finished length: **2:40–2:50**, with a hard stop before **3:00**. The current [BUHack rules](https://buhack-2.devpost.com/rules) require a video under three minutes, which is stricter than the earlier five-minute wording. Rehearse once with a stopwatch. The spoken text below is separate from the screen instructions.

## Read this aloud

Hi, I built ExplainBack for students who recognise a concept but cannot explain why it works.

The goal is simple: bring a belief, test it, and leave with a reason.

Here, I confidently believe that a stiffer material must be stronger. ExplainBack suggests a prepared investigation, and I choose it. This is transparent topic matching, not an AI diagnosis.

Before seeing the strength limits, I predict that material A must withstand more force because its stress–strain slope is steeper.

Now I test that prediction. These are fictional rods with identical dimensions. At two thousand newtons, the stiffer A has reached its failure limit, while B remains intact. Each force setting tests a fresh pair of rods. The calculation does not pretend a broken rod can spring back.

The distinction becomes visible: stiffness describes the elastic slope; strength describes a separate limit.

I explain that in my own words. Pip uses GPT-OSS twenty B, running locally through Ollama, to give short feedback on this answer. The excerpt shows which words it reviewed. That does not make its judgement infallible.

The reviewed explanation and quick check are available immediately, even if the model is slow. A wrong answer gives a correction and still lets me continue.

Next comes a different case, with different material properties. I apply the idea instead of repeating my first prediction.

The learning card records my original belief, prediction, revised explanation, and check results. My confidence rating stays separate from those results.

The prototype combines local language feedback with reviewed explanations, deterministic experiments, and a transfer question. It uses JavaScript, a Node backend, and Ollama. Pip has no terminal or file tools.

The next step is testing with students to see whether the correction lasts. For this hackathon, the working demonstration is one belief made clearer—and a reason the student can use again.

## What to show while speaking

| Approximate time | Screen action                                                                                                                                                                       | Evidence for judges                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:15        | Home screen: ExplainBack and the before/after example.                                                                                                                              | Clear problem and product identity.                                                                                      |
| 0:15–0:35        | Choose Stress & strain and **Local AI**. Paste the initial belief below; select confidence **5**. Confirm **Can a stiffer material fail first?**                                    | Student owns the belief; topic choice is visible and changeable.                                                         |
| 0:35–0:48        | Choose **A must have the higher failure load**. Briefly show that the failure limits are hidden. Press **Test my prediction**.                                                      | Prediction is recorded before the result.                                                                                |
| 0:48–1:15        | Show 1,000 N briefly, then select **2,000 N**. Keep the graph and A/B result cards visible.                                                                                         | A fails at 1,500 N; B's limit is 3,000 N and its extension at 2,000 N is 2.00 mm. Explain the fresh-specimen assumption. |
| 1:15–1:48        | Paste the explanation below; press **Ask Pip & see the explanation**. Show a real response, its excerpt, and the reviewed explanation.                                              | Actual local inference, visible provenance, useful teaching independent of inference.                                    |
| 1:48–2:10        | Complete the quick check with **A has twice the Young’s modulus**. Open the optional rewrite and paste it. Press **Apply it somewhere new** without pressing **Review my rewrite**. | The typed rewrite is kept with the session; another model call is optional.                                              |
| 2:10–2:25        | Select **Only Q, although it is less stiff**; check the answer. Finish the session.                                                                                                 | Different P/Q case; correct stress/limit reasoning.                                                                      |
| 2:25–2:48        | Show the card, including initial belief, prediction, rewrite, and separate confidence/check results. End on the product.                                                            | Complete learning loop, technical design, honest scope.                                                                  |

The timings are editing targets, not a promise about model latency. If the narration runs long, shorten pauses or use the shorter closing sentence below. Do not speed speech until it becomes hard to understand.

## Copy these into the demo

**Initial belief**

```text
I think a stiffer material must always be stronger.
```

**Explanation after exploring the counterexample**

```text
Young's modulus measures the initial elastic slope, not the failure strength. A is stiffer but reaches its 150 MPa limit before B reaches 300 MPa, so the steeper slope alone cannot tell me which rod can withstand more force.
```

**Optional rewrite**

```text
I used to treat stiffness and strength as the same property. Now I separate the elastic slope from the failure limit. A stiffer rod can fail before a less stiff one.
```

At the final confidence prompt, choose an honest rating. The app does not require confidence to rise, and the video should not imply it measures mastery.

**Shorter closing if needed**

> ExplainBack combines local AI feedback with reviewed experiments and a new application question. The next step is testing whether the correction lasts. Bring a belief. Leave with a reason.

## Recording notes

- Record the **local** app at http://127.0.0.1:4173. Confirm the sidebar says the local model is ready. Keep a fresh tab for the recording.
- Paste the three prepared texts to keep the video concise. The final video should show real interaction and a real model response, not mocked AI text.
- Prepare the explanation and run one rehearsal before recording. If model output is incorrect or vague, correct the issue or record another honest attempt; never narrate a result the screen does not support.
- If inference is slow, show that the reviewed explanation is already usable. A cut across a wait is fine if labelled **inference wait shortened**. Do not present a prerecorded result as a new live response.
- Keep the pointer away from small text and pause briefly on the graph, model excerpt, and final card. Avoid spending the video scrolling through all three lessons.
- Upload the finished video to YouTube, Vimeo, or Youku and check its playback and permissions from a signed-out browser. Use a link judges can open. Keep the final exported duration below 3:00.

## Video upload text

**Title:** ExplainBack — BUHack 2.0 EdTech Demo

**Description:**

ExplainBack helps students test a confident belief, explore a reviewed counterexample, explain the correction, and apply the idea to a new case. This recording demonstrates the local GPT-OSS 20B version through Ollama. A guided mode also works without a model.

Built for BUHack 2.0, Tertiary School Track, EdTech. Solo participation was approved by the organizers.

Repository: https://github.com/yermukhamed0777/explainback-buhack-2026

The materials are fictional teaching examples. The model provides qualitative feedback, not a numerical mastery grade. Learning effectiveness has not yet been established in a student study.
