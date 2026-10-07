/**
 * 대체 운동 추천 (PRD 4장 + DECISIONS.md). 순수 함수만 둔다.
 *
 * 후보 조건 (모두 만족)
 *  1. 세부 타깃이 같다
 *  2. 기구가 내 헬스장에 있다 (또는 맨몸)
 *  3. 기구가 '사용 중'이 아니다
 *  4. 오늘 루틴에 이미 있는 운동이 아니다 (완료·건너뜀 포함)
 *
 * 정렬: 점수 ↓ → 프리웨이트 우선 → 데이터 순서
 */
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISES, EXERCISES_BY_ID, EXERCISE_INDEX } from '../data/exercises.js';
import { ISOLATION, PATTERNS, TARGETS } from '../data/taxonomy.js';

export const MAX_SUGGESTIONS = 3;

/**
 * 내 헬스장에서 쓸 수 있는 기구인지 (맨몸은 항상 가능)
 * @param {string} equipmentId
 * @param {Iterable<string>} ownedEquipmentIds
 */
export function isOwned(equipmentId, ownedEquipmentIds) {
  if (EQUIPMENT_BY_ID[equipmentId]?.alwaysAvailable) return true;
  return new Set(ownedEquipmentIds).has(equipmentId);
}

/**
 * "자리 없음"을 누를 수 있는 운동인지. 맨몸·직접 입력 운동은 미루기/건너뛰기만 가능.
 * @param {string | null | undefined} exerciseId
 */
export function canMarkBusy(exerciseId) {
  const exercise = exerciseId ? EXERCISES_BY_ID[exerciseId] : null;
  return Boolean(exercise && !EQUIPMENT_BY_ID[exercise.equipmentId]?.alwaysAvailable);
}

/**
 * @param {import('../data/exercises.js').Exercise} original
 * @param {import('../data/exercises.js').Exercise} candidate
 */
export function scoreCandidate(original, candidate) {
  let score = 0;
  if (candidate.pattern === original.pattern) score += 3;
  if (candidate.equipmentId !== original.equipmentId) score += 1;
  if (EQUIPMENT_BY_ID[candidate.equipmentId]?.alwaysAvailable) score -= 1;
  return score;
}

/**
 * 추천 이유 한 줄.
 * 예: "같은 가슴 운동 · 비어 있는 덤벨 사용 · 비슷한 수평 밀기 동작"
 */
export function buildReason(original, candidate) {
  const equipment = EQUIPMENT_BY_ID[candidate.equipmentId];
  const parts = [
    `같은 ${TARGETS[candidate.target].label} 운동`,
    equipment.alwaysAvailable ? '기구 없이 맨몸으로' : `비어 있는 ${equipment.shortName} 사용`,
  ];
  if (candidate.pattern === original.pattern && candidate.pattern !== ISOLATION) {
    parts.push(`비슷한 ${PATTERNS[candidate.pattern]} 동작`);
  }
  return parts.join(' · ');
}

/**
 * @typedef {Object} SubstituteContext
 * @property {Iterable<string>} ownedEquipmentIds
 * @property {Iterable<string>} [busyEquipmentIds]
 * @property {Iterable<string>} [excludeExerciseIds]  오늘 루틴에 있는 운동 id
 *
 * @typedef {Object} Suggestion
 * @property {import('../data/exercises.js').Exercise} exercise
 * @property {number} score
 * @property {string} reason
 */

/**
 * @param {string} exerciseId 원래 운동
 * @param {SubstituteContext} ctx
 * @param {number} [limit]
 * @returns {Suggestion[]}
 */
export function getSubstitutes(exerciseId, ctx, limit = MAX_SUGGESTIONS) {
  const original = EXERCISES_BY_ID[exerciseId];
  if (!original) return [];

  const owned = new Set(ctx.ownedEquipmentIds);
  const busy = new Set(ctx.busyEquipmentIds ?? []);
  const excluded = new Set(ctx.excludeExerciseIds ?? []);
  excluded.add(original.id);

  return EXERCISES.filter(
    (candidate) =>
      candidate.target === original.target &&
      isOwned(candidate.equipmentId, owned) &&
      !busy.has(candidate.equipmentId) &&
      !excluded.has(candidate.id),
  )
    .map((candidate) => ({
      exercise: candidate,
      score: scoreCandidate(original, candidate),
      reason: buildReason(original, candidate),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(EQUIPMENT_BY_ID[b.exercise.equipmentId].freeWeight) -
          Number(EQUIPMENT_BY_ID[a.exercise.equipmentId].freeWeight) ||
        EXERCISE_INDEX[a.exercise.id] - EXERCISE_INDEX[b.exercise.id],
    )
    .slice(0, limit);
}

/** 대체 후 토스트: "루틴을 바꿨어요. 같은 허벅지 앞 운동이에요 💪" */
export function swapToastMessage(exerciseId) {
  const exercise = EXERCISES_BY_ID[exerciseId];
  const label = exercise ? TARGETS[exercise.target].label : '';
  return `루틴을 바꿨어요. 같은 ${label} 운동이에요 💪`;
}
