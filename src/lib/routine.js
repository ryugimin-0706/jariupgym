/** 루틴 관련 순수 함수 */
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { BODY_PARTS, TARGETS } from '../data/taxonomy.js';
import { DEFAULT_SETS, PRESET_ROUTINES } from '../data/presetRoutines.js';
import { getSubstitutes, isOwned } from './recommend.js';

export const MIN_EXERCISES_PER_SPLIT = 2;

let counter = 0;
/** 짧은 고유 id (루틴 분할, 운동 항목 key용) */
export function makeId(prefix) {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

/**
 * @typedef {Object} AdaptedExercise
 * @property {string} id
 * @property {string} exerciseId
 * @property {number} sets
 * @property {string} [adaptedFrom] 대체된 경우 원래 운동 id ("내 헬스장 맞춤" 태그)
 *
 * @typedef {Object} AdaptedSplit
 * @property {string} id
 * @property {string} name
 * @property {AdaptedExercise[]} exercises
 * @property {string[]} droppedExerciseIds 대체 후보가 없어 뺀 운동
 * @property {boolean} tooFew               운동이 MIN_EXERCISES_PER_SPLIT 미만
 */

/**
 * 추천 루틴을 내 헬스장 기구에 맞게 바꾼다 (화면 2-B).
 * - 기구가 있으면 그대로
 * - 없으면 대체 추천 1순위로 교체 (조건 4는 분할 안에서만, '사용 중' 없음)
 * - 대체 후보가 없으면 뺀다
 * @param {Iterable<string>} ownedEquipmentIds
 * @returns {AdaptedSplit[]}
 */
export function adaptPresetRoutines(ownedEquipmentIds, presets = PRESET_ROUTINES) {
  const owned = new Set(ownedEquipmentIds);

  return presets.map((preset) => {
    // 분할 안의 운동(원래 + 이미 고른 대체)은 후보에서 제외
    const inSplit = new Set(preset.exerciseIds);
    const exercises = [];
    const droppedExerciseIds = [];

    for (const exerciseId of preset.exerciseIds) {
      const exercise = EXERCISES_BY_ID[exerciseId];
      if (isOwned(exercise.equipmentId, owned)) {
        exercises.push({ id: makeId('e'), exerciseId, sets: DEFAULT_SETS });
        continue;
      }
      const [best] = getSubstitutes(exerciseId, { ownedEquipmentIds: owned, excludeExerciseIds: inSplit }, 1);
      if (best) {
        inSplit.add(best.exercise.id);
        exercises.push({ id: makeId('e'), exerciseId: best.exercise.id, sets: DEFAULT_SETS, adaptedFrom: exerciseId });
      } else {
        droppedExerciseIds.push(exerciseId);
      }
    }

    return {
      id: preset.id,
      name: preset.name,
      exercises,
      droppedExerciseIds,
      tooFew: exercises.length < MIN_EXERCISES_PER_SPLIT,
    };
  });
}

/**
 * 홈 분할 카드용 요약: 운동 개수, 주요 부위(많은 순, 같으면 가슴·등·하체·어깨·팔 순).
 * 직접 입력한 운동은 부위를 모르므로 개수에만 포함한다.
 * @param {import('./storage.js').Split} split
 * @returns {{ count: number, bodyParts: string[] }}
 */
export function summarizeSplit(split) {
  const counts = new Map();
  for (const e of split.exercises) {
    const exercise = e.exerciseId ? EXERCISES_BY_ID[e.exerciseId] : null;
    if (!exercise) continue;
    const part = TARGETS[exercise.target].bodyPart;
    counts.set(part, (counts.get(part) ?? 0) + 1);
  }
  const bodyParts = BODY_PARTS.filter((b) => counts.has(b.id))
    .sort((a, b) => counts.get(b.id) - counts.get(a.id))
    .map((b) => b.name);
  return { count: split.exercises.length, bodyParts };
}
