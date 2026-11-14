export function evaluate(lesson, answers) {
  const normalize = text => (text || '').toLowerCase().replace(/[’‘]/g,"'");
  const initial = normalize(answers[0]);
  const initialMisconceptions = lesson.misconceptions.filter(item=>item.pattern.test(initial));
  const initialScore = Math.round(lesson.criteria.filter((item,i)=>item.patterns.some(pattern=>pattern.test(initial))&&!initialMisconceptions.some(m=>m.criterion===i)).length/lesson.criteria.length*100);
  // Each authored follow-up targets the corresponding criterion. A later answer
  // supersedes the first explanation, so a genuine correction is not penalized.
  const evidence = lesson.criteria.map((item,i)=>normalize(answers[i+1]?.trim()?answers[i+1]:answers[0]));
  const misconceptions = lesson.misconceptions.filter(item=>item.pattern.test(evidence[item.criterion]));
  const criteria = lesson.criteria.map((item,i) => ({...item, covered:item.patterns.some(pattern=>pattern.test(evidence[i]))}));
  for(const misconception of misconceptions) criteria[misconception.criterion].covered = false;
  const score = Math.round(criteria.filter(item=>item.covered).length / criteria.length * 100);
  return {criteria, misconceptions, score, initialScore, initialMisconceptions};
}
export function calibration(confidence, score) {
  const expected = (confidence - 1) * 25;
  const gap = expected - score;
  if(gap > 25) return {label:'A useful confidence gap',description:'Your starting confidence was higher than the evidence found in your first explanation. See below for how your follow-up answers changed the picture.',gap};
  if(gap < -25) return {label:'More evidence than you expected',description:'Your first explanation covered more of the rubric than your initial confidence suggested. See your follow-up coverage below, then try the transfer check.',gap};
  return {label:'Confidence meets the evidence',description:'Your initial confidence and first-explanation coverage are broadly aligned. Your follow-up answers and transfer check add a different perspective.',gap};
}
