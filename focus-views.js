import { escape, icon, button } from "./components.js";
import {
  investigations,
  suggestInvestigation,
  investigationFor,
} from "./investigations.js";
import { labView } from "./labs.js";

export function routeView(session) {
  const suggested = suggestInvestigation(session.belief);
  return `<div class="session-heading"><span class="overline">YOUR BELIEF SETS THE DIRECTION</span><h1>Choose a belief to test.</h1><p>${suggested ? "This topic matches words in your explanation. Confirm it or choose another investigation." : "Your explanation may cover several ideas, or a topic outside these prepared investigations. Choose the one you want to test."}</p></div><blockquote class="route-belief">“${escape(session.belief)}”</blockquote><p class="small-note">Topic matching happens on this device. It does not diagnose whether your belief is right or wrong.</p><div class="investigation-grid">${investigations.map((item) => `<button class="surface investigation-card ${item.id === suggested ? "recommended" : ""}" data-action="choose-investigation" data-value="${item.id}" data-testid="investigation-${item.id}"><span class="overline">${item.id === suggested ? "SUGGESTED FOR YOUR BELIEF" : "A PREPARED INVESTIGATION"}</span><h2>${escape(item.title)}</h2><p>${escape(item.belief)}</p><span class="investigation-action">Make a prediction ${icon("arrow")}</span></button>`).join("")}</div><div class="route-alternative"><p>Want to cover the whole lesson instead?</p>${button("Explore all three ideas", "route-full", { secondary: true, testid: "route-full" })}</div>`;
}

export function predictionView(session) {
  const investigation = investigationFor(session);
  return `<div class="session-topline"><button class="text-button" data-action="change-investigation">${icon("back")} Choose another investigation</button><span>PREDICT BEFORE YOU REVEAL</span></div><div class="session-heading"><span class="overline">${escape(investigation.title)}</span><h1>What do you expect?</h1><p>Commit to a prediction. A surprising result is something useful to explain.</p></div><section class="surface prediction-card" data-testid="prediction-card"><h2>${escape(investigation.prompt)}</h2>${investigation.id === "stiffness" ? '<div class="slope-preview"><div><b>Material A</b><span>Initial slope: 200 GPa</span></div><span>vs</span><div><b>Material B</b><span>Initial slope: 100 GPa</span></div></div><p class="small-note">Same rod dimensions. Failure limits are hidden until you test your prediction.</p>' : ""}<div class="answer-options" role="group" aria-label="Make a prediction">${investigation.options.map((label, index) => `<button class="${session.prediction.choice === index ? "selected" : ""}" data-action="prediction-option" data-value="${index}" data-testid="prediction-option-${index}" aria-pressed="${session.prediction.choice === index}"><span>${String.fromCharCode(65 + index)}</span>${escape(label)}</button>`).join("")}</div><div class="form-footer"><span class="small-note">A prediction is recorded, not graded by AI.</span>${button("Test my prediction", "reveal-prediction", { arrow: true, testid: "reveal-prediction", disabled: session.prediction.choice === null })}</div></section>`;
}

export function evidenceView(session, values) {
  const investigation = investigationFor(session);
  if (!investigation || !session.prediction?.checked) return "";
  return `<section class="surface investigation-evidence" data-testid="investigation-evidence"><div class="evidence-intro"><span class="overline">YOUR PREDICTION MEETS A COUNTEREXAMPLE</span><h2>${session.prediction.choice === investigation.answer ? "Your prediction holds up. Here is why." : "Here is the part worth changing."}</h2><p class="recorded-prediction"><b>You predicted:</b> ${escape(investigation.options[session.prediction.choice])}</p><p>${escape(investigation.outcome)}</p></div><div class="focus-lab" data-testid="prediction-lab">${labView("stress", session.step, values)}</div><p class="evidence-next">Now explain the relationship in your own words. Pip reviews that explanation, not your multiple-choice prediction.</p></section>`;
}
