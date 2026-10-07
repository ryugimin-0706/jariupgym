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

/** 분할 이름 칩 (화면 2-A). 누르면 "{칩} 하는날"로 들어간다. */
export const SPLIT_NAME_CHIPS = ['가슴', '등', '하체', '어깨', '팔', '상체', '전신'];
export const splitNameFromChip = (chip) => `${chip} 하는날`;

export const MIN_SETS = 1;
export const MAX_SETS = 10;

/**
 * 배열에서 index 항목을 위(-1)/아래(+1)로 한 칸 옮긴 새 배열. 끝에서는 그대로.
 * @template T
 * @param {T[]} list
 * @param {number} index
 * @param {-1 | 1} dir
 * @returns {T[]}
 */
export function moveItem(list, index, dir) {
  const to = index + dir;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

/**
 * 운동 담기 시트를 처음 열 때 보여줄 부위 탭: 분할 이름에 부위 이름이 있으면 그 탭, 없으면 가슴.
 * 예: "등 하는날" → back, "상체 하는날" → chest
 * @param {string} splitName
 */
export function guessBodyPart(splitName) {
  return BODY_PARTS.find((b) => splitName.includes(b.name))?.id ?? BODY_PARTS[0].id;
}

/**
 * 저장 가능 여부: 분할 1개 이상, 모든 분할에 이름과 운동 1개 이상.
 * @param {import('./storage.js').Split[]} splits
 * @returns {{ ok: boolean, reason: string | null }}
 */
export function validateRoutineDraft(splits) {
  if (splits.length === 0) return { ok: false, reason: '분할을 1개 이상 만들어 주세요' };
  const unnamed = splits.find((s) => !s.name.trim());
  if (unnamed) return { ok: false, reason: '이름이 없는 분할이 있어요' };
  const empty = splits.filter((s) => s.exercises.length === 0);
  if (empty.length) return { ok: false, reason: `운동을 담아 주세요: ${empty.map((s) => s.name.trim()).join(', ')}` };
  return { ok: true, reason: null };
}
