import { MATERIALS, materialResponse } from "./materials.js";
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
  if (lessonId === "stress" && step === 1) return stiffnessLab(values);
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

export function stiffnessLab(values) {
  const force = values.force ?? 1000;
  const responses = MATERIALS.map((material) => ({
    ...material,
    ...materialResponse(material, force),
  }));
  const x = (strain) => 48 + (strain / 0.0035) * 300;
  const y = (stress) => 210 - (stress / 350) * 170;
  return `<div class="lab-heading"><span class="overline">STIFFNESS ≠ STRENGTH</span><h3>Turn up the load.</h3><p>Fictional materials; same 10 mm² area and 1,000 mm length. A simplified linear-elastic model ends at each failure limit. It does not model yielding or a real material’s full curve. Each force setting tests a fresh pair of rods; this is not a loading/unloading history.</p></div><svg class="material-chart" viewBox="0 0 410 260" role="img" aria-label="Stress versus strain. Material A has a steeper slope but ends at 150 MPa; material B ends at 300 MPa."><path d="M48 28V210H355" fill="none" stroke="#617453"/><text x="52" y="20">Stress (MPa)</text><text x="140" y="249">Engineering strain (%)</text><text x="18" y="215">0</text><text x="12" y="141">150</text><text x="12" y="68">300</text><text x="42" y="228">0</text><text x="120" y="228">0.1</text><text x="207" y="228">0.2</text><text x="293" y="228">0.3</text>${responses
    .map((material, index) => {
      const endStrain = material.strengthMPa / (material.youngGPa * 1000);
      return `<path d="M48 210L${x(endStrain)} ${y(material.strengthMPa)}" fill="none" stroke="${index ? "#746080" : "#30634a"}" stroke-width="3"/><circle cx="${x(endStrain)}" cy="${y(material.strengthMPa)}" r="5" fill="${index ? "#746080" : "#30634a"}"/><text x="${x(endStrain) + 8}" y="${y(material.strengthMPa) - 6}">${material.id.toUpperCase()} limit</text>${!material.failed ? `<circle cx="${x(material.strain)}" cy="${y(material.stressMPa)}" r="6" fill="#bd642b" stroke="#fff" stroke-width="2"/>` : ""}`;
    })
    .join(
      "",
    )}</svg><label class="range-label" for="lab-force">Applied tensile force <b>${force.toLocaleString()} N</b></label><input id="lab-force" type="range" min="0" max="3500" step="100" value="${force}" data-lab="force"><div class="segmented">${[1000, 2000, 3000].map((n) => `<button data-action="lab-force" data-value="${n}" aria-pressed="${force === n}">${n.toLocaleString()} N</button>`).join("")}</div><div class="material-results" aria-live="polite">${responses.map((material) => `<article class="material-result ${material.failed ? "failed" : ""}"><h4>${material.name}</h4><p>E = ${material.youngGPa} GPa<br>Failure limit = ${material.strengthMPa} MPa</p><b>${material.failed ? "Failure limit reached" : "Intact · " + material.extensionMM.toFixed(2) + " mm extension"}</b><small>${material.failed ? "Requested stress F/A₀" : "Applied engineering stress"}: ${material.stressMPa.toFixed(0)} MPa${material.failed ? ". Elastic extension is not extrapolated after failure." : ""}</small></article>`).join("")}</div><p class="lab-conclusion">At 2,000 N, stiffer A has reached its 1,500 N failure limit while B remains intact below its 3,000 N limit. The slope alone did not determine strength.</p>`;
}
