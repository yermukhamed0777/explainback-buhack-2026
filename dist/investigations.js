export const investigations = [
  {
    id: "area",
    index: 0,
    initialLab: { area: 2 },
    title: "Does the force tell the whole story?",
    belief: "“Same force means the same stress.”",
    prompt:
      "Two rods carry the same 100 N tensile force. The second rod has twice the original cross-sectional area. Predict its engineering stress relative to the first rod.",
    options: ["Twice as much stress", "The same stress", "Half as much stress"],
    answer: 2,
    outcome:
      "The force is spread over twice the area. Engineering stress halves because σ = F/A₀.",
    transfer: {
      question:
        "Two cables carry the same 600 N load. Cable P has original area 3 mm²; Q has 6 mm². Which statement is correct?",
      options: [
        "Both have 600 MPa stress",
        "P has 200 MPa stress and Q has 100 MPa",
        "P has 100 MPa stress and Q has 200 MPa",
        "Q has twice the stress because it is thicker",
      ],
      answer: 1,
      explanation:
        "Stress is force divided by original area: P = 600/3 = 200 N/mm² = 200 MPa; Q = 600/6 = 100 MPa. The same force can produce different stress.",
    },
  },
  {
    id: "stiffness",
    index: 1,
    initialLab: { force: 1000 },
    title: "Can a stiffer material fail first?",
    belief: "“A stiffer material must be stronger.”",
    prompt:
      "Material A has twice the initial stress–strain slope of B. Both rods have the same dimensions. Using only that slope information, what can you conclude about which rod has the higher failure load?",
    options: [
      "A must have the higher failure load",
      "B must have the higher failure load",
      "The slope alone cannot determine the failure load",
    ],
    answer: 2,
    outcome:
      "Young’s modulus controls the initial slope. A strength limit is separate information. In this fictional example, A is stiffer but reaches its failure limit first.",
    transfer: {
      question:
        "A new pair of fictional rods has the same 10 mm² area. P: E = 180 GPa, failure strength = 120 MPa. Q: E = 90 GPa, failure strength = 240 MPa. In the idealized elastic-to-failure model, which rod remains intact under a 1,800 N tensile force?",
      options: [
        "Only P, because it is stiffer",
        "Only Q, although it is less stiff",
        "Both, because their areas are equal",
        "Neither, because modulus determines failure",
      ],
      answer: 1,
      explanation:
        "Each rod has engineering stress 1,800/10 = 180 MPa. This exceeds P’s 120 MPa failure limit but is below Q’s 240 MPa limit. Q survives this idealized example despite its smaller modulus. Do not extrapolate an elastic extension for P after failure.",
    },
  },
  {
    id: "yield",
    index: 2,
    initialLab: { yielded: true },
    title: "Does stretching always spring back?",
    belief: "“Removing the force undoes all stretching.”",
    prompt:
      "A specimen is stretched beyond yield and then fully unloaded. Predict whether it returns completely to its original length.",
    options: [
      "Yes, removing the force removes all strain",
      "No, a permanent plastic component remains",
      "It must get shorter than its original length",
    ],
    answer: 1,
    outcome:
      "Unloading recovers the elastic component. Plastic strain remains; removing the load does not undo all deformation.",
    transfer: {
      question:
        "A 200 mm gauge length stretches to 210 mm under load and measures 204 mm after unloading. What permanent engineering strain remains?",
      options: ["0%", "2%", "3%", "5%"],
      answer: 1,
      explanation:
        "Permanent strain uses the unloaded and original lengths: (204−200)/200 = 0.02 = 2%. The 6 mm recovered during unloading was the elastic component of extension.",
    },
  },
];

export function suggestInvestigation(belief) {
  const text = belief.toLowerCase();
  const matches = [];
  if (
    /stiff|modulus|young|slope|steep/.test(text) &&
    /strong|strength|break|fail|fracture/.test(text)
  )
    matches.push("stiffness");
  if (/yield|plastic|permanent|spring.?back|return.*length|reversib/.test(text))
    matches.push("yield");
  if (/area|thick|stress/.test(text) && /force|load|area|thick/.test(text))
    matches.push("area");
  return matches.length === 1 ? matches[0] : null;
}
export function investigationFor(session) {
  return investigations.find((item) => item.id === session.focus) || null;
}
export function transferFor(session, lesson) {
  return investigationFor(session)?.transfer || lesson.transfer;
}
export function activeIndices(session) {
  return investigationFor(session) ? [session.step] : [0, 1, 2];
}
