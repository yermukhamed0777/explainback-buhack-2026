import test from 'node:test';
import assert from 'node:assert/strict';
import {createCoach,validateInput,validateReport} from '../scripts/coach.mjs';

const input={action:'report',lessonId:'stress',explanation:'Stress is force divided by original cross-sectional area.',questions:['What happens when the area doubles?','What does the slope tell us about a material?','What happens after the yield point?'],answers:['The stress halves at the same force.','A steeper slope means greater stiffness, not necessarily strength.','Plastic deformation leaves a permanent change in length.']};
const item=(covered,evidence='')=>({covered,evidence,feedback:'Check the lesson notes to confirm the reasoning.'});
const report=()=>({initial:[item(true,'Stress is force divided by original cross-sectional area.'),item(false),item(false)],final:[item(true,'The stress halves at the same force.'),item(true,'greater stiffness, not necessarily strength'),item(true,'Plastic deformation leaves a permanent change in length.')],summary:'You clarified stiffness and plastic deformation in your later answers.'});

test('live reports validate all three criteria and real evidence',()=>{
  assert.equal(validateInput(input).index,3);
  assert.equal(validateReport(report(),input).final.length,3);
});
test('fabricated evidence is rejected instead of presented to the learner',()=>{
  const bad=report();bad.final[0].evidence='A sentence the student never wrote.';
  assert.throws(()=>validateReport(bad,input),/quoted excerpt/);
});
test('missing or wrongly typed criteria are rejected',()=>{
  const missing=report();missing.final.pop();assert.throws(()=>validateReport(missing,input),/criterion/);
  const wrong=report();wrong.final[0].covered='yes';assert.throws(()=>validateReport(wrong,input),/invalid feedback/);
});
test('uncovered criteria do not require invented quotations',()=>{
  const empty=report();empty.final=Array.from({length:3},()=>item(false));
  assert.equal(validateReport(empty,input).final[0].covered,false);
});
test('malformed histories and oversized explanations never reach the model',()=>{
  assert.throws(()=>validateInput({...input,answers:[]}),/incomplete/);
  assert.throws(()=>validateInput({...input,lessonId:'unknown'}),/lesson/);
  assert.throws(()=>validateInput({...input,explanation:'a'.repeat(4001)}),/4000/);
  assert.throws(()=>validateInput({...input,action:'question',questionIndex:-1}),/question number/);
});
test('the local coach cannot be configured to send student work off-device',()=>{
  assert.throws(()=>createCoach({baseURL:'https://example.com/v1'}),/loopback/);
});
test('live result scores come from model assessments and keep authored note references',async()=>{
  const coach=createCoach({generate:async()=>({output:report()})});
  const result=await coach.respond(input);
  assert.equal(result.source,'local-ai');assert.equal(result.score,100);assert.equal(result.initialScore,33);
  assert.deepEqual(result.criteria.map(c=>c.note),[0,1,2]);
  assert.equal(result.criteria[1].evidence,'greater stiffness, not necessarily strength');
});
test('a question request sends only its preceding conversation and returns live provenance',async()=>{
  let called=false;
  const coach=createCoach({generate:async options=>{called=true;assert.match(options.prompt,/criterion 2/);assert.match(options.prompt,/The stress halves/);assert.match(options.prompt,/referenceQuestion/);assert.match(options.prompt,/self-contained/);return {output:{question:'How would you distinguish stiffness from strength in this situation?'}};}});
  const result=await coach.respond({...input,action:'question',questionIndex:1,questions:input.questions.slice(0,1),answers:input.answers.slice(0,1)});
  assert.ok(called);assert.equal(result.model,'gpt-oss:20b');assert.equal(result.source,'local-ai');
});
