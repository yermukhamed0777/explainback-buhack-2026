export function stress(force, area) {
  return force / area;
}
export function extension(modulusRatio) {
  return 2 / modulusRatio;
}
export function opportunity(options, chosen) {
  return Math.max(...options.filter((_, index) => index !== chosen));
}

export function labView(lessonId, step, values) {
  if (lessonId === "stress" && step === 0) {
    const force = 100,
      area = values.area || 1,
      sigma = stress(force, area);
    return `<div class="lab-heading"><span class="overline">PREDICTION LAB</span><h3>Same pull. More material.</h3><p>Change the area. Watch what happens to stress.</p></div><div class="stress-demo" aria-hidden="true"><span>← 100 N</span><div class="rod" style="height:${24 + area * 9}px"><i></i><i></i><i></i><i></i></div><span>100 N →</span></div><label class="range-label" for="lab-area">Cross-sectional area <b id="area-readout">${area} cm²</b></label><input type="range" id="lab-area" data-lab="area" min="1" max="4" step="1" value="${area}" aria-describedby="lab-result"><div id="lab-result" class="lab-result"><b>${sigma.toFixed(0)} N/cm²</b><span>Stress = 100 N ÷ ${area} cm²${area === 2 ? " · Twice the area. Half the stress." : ""}</span></div>`;
  }
  if (lessonId === "stress" && step === 1) {
    const ratio = values.modulus || 1,
      delta = extension(ratio);
    return `<div class="lab-heading"><span class="overline">PREDICTION LAB</span><h3>Stiffer does not mean stronger.</h3><p>Same small force and dimensions, both in their linear elastic regions.</p></div><div class="extension-demo"><div><span>Reference rod</span><i style="width:90%"></i><b>2 mm</b></div><div><span>Your material</span><i style="width:${90 / ratio}%"></i><b>${delta.toFixed(2)} mm</b></div></div><label class="range-label" for="lab-modulus">Young’s modulus relative to reference <b>${ratio}×</b></label><input type="range" id="lab-modulus" data-lab="modulus" min="1" max="4" step="1" value="${ratio}"><div class="lab-result" aria-live="polite"><b>${delta.toFixed(2)} mm extension</b><span>Extension falls as stiffness rises. This does not tell us the breaking strength.</span></div>`;
  }
  if (lessonId === "stress") {
    const beyond = values.yielded === true;
    return `<div class="lab-heading"><span class="overline">COUNTEREXAMPLE LAB</span><h3>Take the load away.</h3><p>Compare unloading before and after yield. Illustration only; not a material simulation.</p></div><div class="unload-demo"><span>Original length</span><div class="original-rod"></div><span>After unloading</span><div class="returned-rod" style="width:${beyond ? "85" : "60"}%"></div></div><div class="segmented"><button data-action="lab-yield" data-value="false" aria-pressed="${!beyond}">Within elastic region</button><button data-action="lab-yield" data-value="true" aria-pressed="${beyond}">Past yield</button></div><div class="lab-result" aria-live="polite"><b>${beyond ? "A permanent change remains" : "Original length recovered"}</b><span>${beyond ? "The elastic part recovers; the plastic part stays." : "Elastic deformation is recoverable when the load is removed."}</span></div>`;
  }
  if (lessonId === "probability") {
    const count = values.flips || 0;
    return `<div class="lab-heading"><span class="overline">COUNTEREXAMPLE LAB</span><h3>The coin has no memory.</h3><p>Imagine an independent fair coin. Add a longer heads streak and inspect the next flip.</p></div><div class="coin-row" aria-label="${count} imagined heads">${Array.from({ length: Math.min(count, 8) }, () => '<span class="coin">H</span>').join("") || '<span class="coin coin-empty">?</span>'}<span class="next-coin">→ <b>50%</b> heads next</span></div><div class="segmented"><button data-action="lab-streak">Add a head to the imagined streak</button><button data-action="lab-reset">Reset</button></div><div class="lab-result"><b>${count} previous heads. Still ½ next.</b><span>This is a thought experiment, not a random sample. Independence is the assumption that keeps the probability unchanged.</span></div>`;
  }
  const rewards = [150, 100, 80],
    chosen = values.chosen ?? 0,
    cost = opportunity(rewards, chosen);
  return `<div class="lab-heading"><span class="overline">TRADE-OFF LAB</span><h3>Choose one. Give something up.</h3><p>Three competing uses of one hour, with assumed values in HKD.</p></div><div class="opportunity-options">${["Tutor · $150", "Work a shift · $100", "Relax · valued at $80"].map((label, index) => `<button data-action="lab-choice" data-value="${index}" aria-pressed="${chosen === index}">${label}</button>`).join("")}</div><div class="lab-result" aria-live="polite"><b>Opportunity cost: $${cost}</b><span>The highest-value available alternative you give up. It is not the sum of all the unchosen options.</span></div>`;
}
