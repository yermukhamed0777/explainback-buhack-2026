import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../dist/lessons.js';
import {evaluate, calibration} from '../dist/engine.js';

test('blank responses never earn coverage',()=>{
  for(const lesson of lessons) assert.equal(evaluate(lesson,['']).score,0);
});
test('mechanics recognizes accurate distinctions and permanent strain',()=>{
  const report=evaluate(lessons[0],[
    'Let me explain what I know about stress and strain.',
    'Stress is force divided by area. At fixed force doubling area halves stress.',
    'The slope measures stiffness, not necessarily higher strength.',
    'Beyond yield, plastic deformation leaves a permanent change in length.'
  ]);
  assert.equal(report.score,100);assert.equal(report.misconceptions.length,0);
});
test('explicit mechanical misconceptions override matching positive phrases',()=>{
  const report=evaluate(lessons[0],[
    '', '',
    'The slope measures stiffness. A steeper slope means higher strength.',
    'After yield it always returns completely. Plastic deformation is permanent.'
  ]);
  assert.equal(report.criteria[1].covered,false);
  assert.equal(report.criteria[2].covered,false);
  assert.equal(report.misconceptions.length,2);
});
test('probability recognizes joint probability and independence',()=>{
  assert.equal(evaluate(lessons[1],[
    'Let me explain independent events.',
    'It stays 50% because previous independent flips do not change this probability.',
    'Multiply one half times one half to get 1/4.',
    'That is mutually exclusive, not independent.'
  ]).score,100);
});
test('economics recognizes time costs, next-best option, and sunk payment',()=>{
  assert.equal(evaluate(lessons[2],[
    'Let me explain opportunity cost.',
    'The next-best alternative is the shift.',
    'The free concert costs time that could be spent studying.',
    'It is a sunk cost and should not determine future choices.'
  ]).score,100);
});
test('later corrected answers replace initial misconceptions',()=>{
  const report=evaluate(lessons[0],[lessons[0].sample,
    'Stress is force divided by area, so it halves.',
    'The initial slope measures stiffness, not strength.',
    'Beyond yield there is permanent plastic deformation.'
  ]);
  assert.equal(report.score,100);
  assert.equal(report.initialScore,0);
  assert.equal(report.misconceptions.length,0);
  assert.equal(report.initialMisconceptions.length,2);
});
test('confidence signals overconfidence, underconfidence, and alignment',()=>{
  assert.ok(calibration(5,0).gap>25);
  assert.ok(calibration(1,100).gap< -25);
  assert.equal(calibration(3,50).gap,0);
});
test('each lesson has a complete rubric, three questions and valid transfer answer',()=>{
  for(const l of lessons){assert.equal(l.criteria.length,3);assert.equal(l.questions.length,3);assert.equal(l.notes.length,3);assert.ok(l.transfer.options[l.transfer.answer]);for(const c of l.criteria)assert.ok(l.notes[c.note]);}
});
