/* ============================================================
   Leitner scheduling. Pure functions, no React, no storage.
   A record is [box, dueDay, timesSeen, timesMissed].
   ============================================================ */

export const BOX_COUNT = 5;
export const MASTERED_BOX = 4;

/** Days until the next review, indexed by box 1..5. */
export const INTERVALS = [1, 3, 7, 21, 45];

export const GRADES = /** @type {const} */ ([
  { id: 'again', label: 'Again', hint: 'back to box 1', key: '1' },
  { id: 'good',  label: 'Good',  hint: 'next box',      key: '2' },
  { id: 'easy',  label: 'Easy',  hint: 'skip a box',    key: '3' },
]);

const DAY_MS = 86_400_000;
export const today = () => Math.floor(Date.now() / DAY_MS);

export const EMPTY = Object.freeze([0, 0, 0, 0]);

export const getRecord = (progress, id) => progress[id] || EMPTY;
export const boxOf     = (progress, id) => getRecord(progress, id)[0];
export const missesOf  = (progress, id) => getRecord(progress, id)[3];

export const isNew      = (progress, id) => boxOf(progress, id) === 0;
export const isMastered = (progress, id) => boxOf(progress, id) >= MASTERED_BOX;
export const isDue      = (progress, id) => {
  const [box, due] = getRecord(progress, id);
  return box > 0 && due <= today();
};

/** Box a word lands in after a grade. `again` always resets to 1. */
const nextBox = (box, grade) => {
  if (grade === 'again') return 1;
  const step = grade === 'easy' ? 2 : 1;
  // Clamp after stepping, not before: an unseen word (box 0) graded Good
  // must land in box 1, not skip straight past it into box 2.
  return Math.min(BOX_COUNT, Math.max(1, box + step));
};

/**
 * Apply a grade to one word.
 * @returns {{ record: number[], correct: boolean }}
 */
export function applyGrade(record, grade) {
  const [box, , seen, missed] = record;
  const correct = grade !== 'again';
  const box2 = nextBox(box, grade);
  const due = correct ? today() + INTERVALS[box2 - 1] : today();
  return {
    record: [box2, due, seen + 1, missed + (correct ? 0 : 1)],
    correct,
  };
}

/** Count how many of `ids` satisfy a predicate bound to progress. */
export const countBy = (ids, progress, fn) =>
  ids.reduce((n, id) => n + (fn(progress, id) ? 1 : 0), 0);

/** Build a study queue for a group: due words first, then unseen ones. */
export function buildGroupQueue(ids, progress) {
  return [
    ...ids.filter((id) => isDue(progress, id)),
    ...ids.filter((id) => isNew(progress, id)),
  ];
}

/** Every due word across the whole deck, shuffled. */
export function buildDueQueue(allIds, progress) {
  const due = allIds.filter((id) => isDue(progress, id));
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  return due;
}
