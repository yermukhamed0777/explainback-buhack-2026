# ExplainBack: 90-second flagship demo

Open http://127.0.0.1:4173 with Ollama running. Keep a second tab for testing; do not overwrite an unfinished user session.

1. **0:00–0:15 — Capture a believable mistake.** Select Stress & strain and Local AI. Enter: “I think a stiffer material must always be stronger.” Choose the suggested stiffness investigation. Explain that the suggestion is local topic matching, and the student can change it.
2. **0:15–0:30 — Make a prediction first.** Choose “A must have the higher failure load.” Test the prediction. The strength limits were not shown before this choice.
3. **0:30–0:50 — Show the counterexample.** Select 2,000 N. A has the steeper elastic slope but has reached its 1,500 N failure limit. B remains intact below its 3,000 N limit. The graph stops each fictional material at its limit. This is an idealized teaching model, not measured material data.
4. **0:50–1:05 — Rebuild the reasoning.** Write: “Young’s modulus measures the elastic slope, not strength. A can be stiffer but reach its failure limit before B.” Pip reviews that one answer. The reviewed explanation is available immediately even while the model responds.
5. **1:05–1:20 — Apply the idea somewhere new.** Answer the quick check with “A has twice the Young’s modulus.” The new P/Q transfer case uses different properties: 1,800 N over 10 mm² demands 180 MPa. Only Q remains below its limit. This is a different case from the initial prediction.
6. **1:20–1:30 — Show what changed.** Make the learning card. It contains the original belief, prediction, reviewed counterexample, optional rewrite, and transfer outcome. Self-reported confidence remains distinct from check results.

If local inference is slow, continue using the reviewed explanation. Never imply that the prepared explanation is a live model response. Do not spend the video waiting for the model or claim the checks establish learning effectiveness.

The additional probability and economics lessons remain available in the full guided format. The current [official rules](https://buhack-2.devpost.com/rules) require a submission video **under three minutes**. Use the [full narration and screen cues](submission/VIDEO-SCRIPT.md), targeting 2:40–2:50, instead of the older five-minute allowance.
