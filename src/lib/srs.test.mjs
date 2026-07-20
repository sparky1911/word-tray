import assert from 'node:assert/strict';
import { applyGrade, isDue, isMastered, isNew, buildGroupQueue, today, INTERVALS } from './srs.js';

const T = today();
let pass = 0;
const check = (name, fn) => { fn(); pass++; console.log('  ok  ' + name); };

check('new word grades up to box 1 and is due tomorrow', () => {
  const { record, correct } = applyGrade([0,0,0,0], 'good');
  assert.equal(record[0], 1);
  assert.equal(record[1], T + INTERVALS[0]);
  assert.equal(correct, true);
});

check('easy skips a box', () => {
  assert.equal(applyGrade([0,0,0,0], 'easy').record[0], 2);
  assert.equal(applyGrade([3,0,0,0], 'easy').record[0], 5);
});

check('box caps at 5', () => {
  assert.equal(applyGrade([5,0,0,0], 'easy').record[0], 5);
  assert.equal(applyGrade([4,0,0,0], 'easy').record[0], 5);
});

check('again resets to box 1, increments misses, due same day', () => {
  const { record, correct } = applyGrade([4, T+21, 9, 2], 'again');
  assert.deepEqual(record, [1, T, 10, 3]);
  assert.equal(correct, false);
});

check('seen count always increments', () => {
  assert.equal(applyGrade([2,0,7,0], 'good').record[2], 8);
});

check('a word needs 4 correct answers to reach mastered', () => {
  let r = [0,0,0,0];
  for (const g of ['good','good','good','good']) r = applyGrade(r, g).record;
  assert.equal(r[0], 4);
  assert.ok(isMastered({ 0: r }, 0));
});

check('due/new predicates', () => {
  assert.ok(isNew({}, 0));
  assert.ok(!isDue({}, 0), 'unseen words are not "due"');
  assert.ok(isDue({ 5: [2, T, 1, 0] }, 5));
  assert.ok(!isDue({ 5: [2, T + 3, 1, 0] }, 5));
});

check('group queue is due words then new words, nothing else', () => {
  const progress = { 0:[2,T,1,0], 1:[3,T+7,4,0], 2:[1,T,1,1] };
  const q = buildGroupQueue([0,1,2,3,4], progress);
  assert.deepEqual(q, [0, 2, 3, 4]);   // 1 is scheduled ahead, so excluded
});

check('interval ladder matches the documented schedule', () => {
  assert.deepEqual(INTERVALS, [1,3,7,21,45]);
});

console.log(`\n${pass} checks passed`);
