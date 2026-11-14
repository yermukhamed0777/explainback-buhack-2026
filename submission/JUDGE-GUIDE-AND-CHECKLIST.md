# ExplainBack — judge guide and final submission checklist

## Product judgement

This is a defensible EdTech hackathon prototype when presented around one clear outcome: a student tests and rebuilds a specific belief. Its strongest contribution is the complete sequence of prediction, manipulable counterexample, explanation, and transfer. The local AI adds feedback on language; it is one part of that sequence.

The idea is reproducible. Do not pitch it as impossible to replicate. The present evidence supports a working prototype and a plausible study use case, not improved grades, lasting learning gains, a validated diagnosis, or reliable mastery grading. The next evaluation should compare explanations and delayed transfer before and after use with real students.

## What judges should be able to see

| Published criterion            | What the demo should establish                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Technical implementation — 30% | Working local model call, physically consistent calculations, immediate reviewed answers, scoped feedback, recovery and saved cards. Keep setup reproducible.            |
| Innovation — 20%               | One coherent belief → prediction → counterexample → revised explanation → different transfer case. Explain the design choices instead of claiming an unprecedented idea. |
| Impact — 20%                   | A concrete student problem and short tutorial/study use case. State that learning effectiveness still needs evaluation.                                                  |
| Presentation — 30%             | A complete, readable demonstration under three minutes; clear README; accessible repository and playable video.                                                          |

These weights and the video rule come from the [official rules](https://buhack-2.devpost.com/rules), checked November 15, 2026. [The event overview](https://buhack-2.devpost.com/) explicitly accepts local deployments; cloud hosting is optional.

## Questions judges may ask

**Why is this more useful than asking a chatbot to explain the topic?**

The interaction records the student's initial belief and prediction, uses a reviewed experiment, and asks for application in a different case. That makes the reasoning and correction inspectable. The prototype does not depend on the model inventing the physics or assigning a mastery score.

**What exactly does AI do?**

Pip reviews one submitted answer with the relevant question and reference. It returns qualitative feedback and, when used, an excerpt from that answer. Topic suggestion is local keyword matching, and the student confirms it. Calculations and check answers are authored separately.

**What if the model is wrong or unavailable?**

The reviewed answer remains available. The student can continue without waiting, use guided mode, and compare the model's interpretation with the lesson. An excerpt is checked for provenance; it is not proof of semantic correctness.

**Does the simulation represent real materials?**

No. The rods are fictional and illustrate independent modulus and failure limits. The model is linear elastic up to a failure threshold, uses equal original geometry, and does not model plasticity or fracture history. Each load setting is a fresh comparison.

**How do you know a student learned?**

The prototype records a check result and transfer attempt; neither is a validated measure of mastery. A future study should include students' explanations and a delayed, different transfer case. Confidence remains self-reported.

**Where does student work go?**

In the local version, inference goes to the configured loopback model service. Drafts and cards use browser storage when available; there is no cloud account or analytics. Pip has no file or terminal tools. This local setup is not a public multi-user backend.

**What did you build during the hackathon and where did AI assist?**

Point to the public commit history and final files. Explain Hermes/GPT-OSS's bounded calculation-module contribution and the subsequent corrections. Describe ChatGPT/Codex assistance plainly. Do not imply AI-generated code was accepted without review.

## Verified event requirements

- Deadline: **November 15, 2026, 10:00 AM HKT**. Target completing submission by **9:30 AM HKT** to leave upload and form-repair time.
- Video: YouTube, Vimeo, or Youku link; **under three minutes**. The older five-minute wording is looser than the current official rules, so use the stricter limit.
- Repository: public, owned by the participant/team, created for this hackathon, with meaningful commits in the November 13, 10:00 AM to November 15, 10:00 AM hacking window.
- One submission per team; no late submissions. Complete every item required by the final form.
- Choose **Tertiary School Track** and **EdTech**. Keep the organizer's solo approval because the public rules still describe teams of two to five.

Sources: [rules](https://buhack-2.devpost.com/rules), [schedule](https://buhack-2.devpost.com/details/dates), [overview](https://buhack-2.devpost.com/). The supplied form screenshots add the practical field list below. Always read the live form before the final submit action.

## Files in this package

- [VIDEO-SCRIPT.md](VIDEO-SCRIPT.md): full narration, exact screen sequence, paste-ready demonstration inputs, upload text.
- [SUBMISSION-TEXT.md](SUBMISSION-TEXT.md): field-by-field project description and technology disclosure.
- This guide: product positioning, judge questions, rules and final checklist.
- [README.md](../README.md): reproducible setup, architecture, limitations and checks.
- [REVIEW.md](../REVIEW.md): implementation audit and observed verification boundaries.

## Final checklist

### Product and source

- [ ] Rehearse the focused stiffness investigation in a fresh tab using Local AI.
- [ ] Confirm the 2,000 N result: A failed; B intact, 2.00 mm extension.
- [ ] Show an actual model response and its correct answer excerpt. Never substitute prepared text for AI output.
- [ ] Show the P/Q transfer case and the saved learning card.
- [ ] Confirm `npm test` and `npm run check` on the final source. Record automated browser-suite status separately from manual checks.
- [ ] Review the final diff, commit, and push. Confirm GitHub contains the actual final milestone and submission documents.
- [ ] Confirm the repository remains public and the final commit is inside the hacking window. Do not backdate commits.
- [ ] Keep private correspondence, credentials, recordings with unrelated desktop data, and local runtime files out of the repository.

### Video

- [ ] Record and export below 3:00; aim for 2:40–2:50.
- [ ] Check that labels and model output can be read at normal playback size.
- [ ] Upload to an accepted host. Paste the resulting URL in the form.
- [ ] Test signed-out playback with audio. The link must not require an invitation or account approval.

### Submission form

- [ ] Project name: ExplainBack.
- [ ] About text: paste the prepared description and check Markdown rendering.
- [ ] Repository link: use the final public GitHub repository.
- [ ] Demo link: a verified public guided-demo URL, or the repository/local-setup link with a clear local-demo explanation where accepted. Never submit a loopback URL.
- [ ] Short demo video: the uploaded playable video URL, not a local file path or script document.
- [ ] Built with: use the actual tools; complete any AI-use disclosure.
- [ ] Select Tertiary School Track and EdTech.
- [ ] Add optional cover/materials only if helpful; inspect the current form for additional required fields.
- [ ] Verify individual event registration and any organizer coordination instructions. Do not assume saving a project draft enters it into the event.
- [ ] Perform the final event submission before the deadline and verify the success state/project entry. Keep a confirmation screenshot.

## Recording-to-submission schedule

Reserve at least 45–60 minutes: rehearse once, record one clear take, trim waits honestly, upload, check playback, then complete and verify the form. With a 10:00 AM deadline, do not leave the upload until the last few minutes.
