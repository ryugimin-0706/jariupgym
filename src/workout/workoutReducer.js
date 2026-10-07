/**
 * 운동 세션 상태 (화면 4·5). 저장된 내 루틴과 별개로, sessionStorage에만 임시 보관한다.
 *
 * items 배열 순서가 곧 화면 순서다.
 *  - 진행 중(pending) 운동이 위, 끝난(done/skipped) 운동이 아래
 *  - 완료·건너뜀 → 맨 아래로
 *  - 미루기·완료 취소 → 진행 중 운동들의 맨 뒤 (끝난 카드보다 위)
 */
import { makeId } from '../lib/routine.js';

/**
 * @typedef {'pending' | 'done' | 'skipped'} ItemStatus
 *
 * @typedef {Object} WorkoutItem
 * @property {string} key
 * @property {string | null} exerciseId   null이면 직접 입력
 * @property {string} [customName]
 * @property {number} sets
 * @property {ItemStatus} status
 * @property {string | null} originalExerciseId 대체된 경우 최초 운동 id
 *
 * @typedef {Object} WorkoutState
 * @property {string} splitId
 * @property {string} splitName
 * @property {WorkoutItem[]} items
 * @property {string[]} busyEquipmentIds
 * @property {number} swapCount            대체 횟수 (미루기·건너뛰기 제외)
 * @property {string | null} lastSwappedKey 하이라이트 애니메이션용
 */

/**
 * @param {import('../lib/storage.js').Split} split
 * @returns {WorkoutState}
 */
export function createWorkout(split) {
  return {
    splitId: split.id,
    splitName: split.name,
    items: split.exercises.map((e) => ({
      key: makeId('w'),
      exerciseId: e.exerciseId,
      ...(e.customName ? { customName: e.customName } : {}),
      sets: e.sets,
      status: 'pending',
      originalExerciseId: null,
    })),
    busyEquipmentIds: [],
    swapCount: 0,
    lastSwappedKey: null,
  };
}

const isPending = (item) => item.status === 'pending';

/** 진행 중 운동들의 맨 뒤(끝난 카드보다 위)로 옮긴다 */
function moveToPendingEnd(items, key, patch = {}) {
  const target = items.find((i) => i.key === key);
  const rest = items.filter((i) => i.key !== key);
  const insertAt = rest.findIndex((i) => !isPending(i));
  const moved = { ...target, ...patch };
  if (insertAt === -1) return [...rest, moved];
  return [...rest.slice(0, insertAt), moved, ...rest.slice(insertAt)];
}

/** 맨 아래로 옮긴다 */
function moveToEnd(items, key, patch = {}) {
  const target = items.find((i) => i.key === key);
  return [...items.filter((i) => i.key !== key), { ...target, ...patch }];
}

/** 오늘 루틴에 있는 운동 id (대체 후보 조건 4: 완료·건너뜀 포함, 대체 전 원래 운동도 포함) */
export function todayExerciseIds(state) {
  const ids = new Set();
  for (const item of state.items) {
    if (item.exerciseId) ids.add(item.exerciseId);
    if (item.originalExerciseId) ids.add(item.originalExerciseId);
  }
  return ids;
}

export function progress(state) {
  const total = state.items.length;
  const done = state.items.filter((i) => i.status === 'done').length;
  const skipped = state.items.filter((i) => i.status === 'skipped').length;
  return { total, done, skipped, finished: total > 0 && done + skipped === total };
}

/**
 * @param {WorkoutState | null} state
 * @param {{ type: string, [key: string]: any }} action
 * @returns {WorkoutState | null}
 */
export function workoutReducer(state, action) {
  if (action.type === 'start') return createWorkout(action.split);
  if (action.type === 'end') return null;
  if (!state) return state;

  const item = action.key ? state.items.find((i) => i.key === action.key) : null;
  if (action.key && !item) return state;

  switch (action.type) {
    // 완료 ⇄ 취소. 건너뛴 카드를 탭하면 다시 진행 중으로.
    case 'toggleDone':
      return {
        ...state,
        items: isPending(item)
          ? moveToEnd(state.items, item.key, { status: 'done' })
          : moveToPendingEnd(state.items, item.key, { status: 'pending' }),
      };

    case 'skip':
      return { ...state, items: moveToEnd(state.items, item.key, { status: 'skipped' }) };

    case 'defer':
      return { ...state, items: moveToPendingEnd(state.items, item.key, { status: 'pending' }) };

    case 'markBusy':
      if (state.busyEquipmentIds.includes(action.equipmentId)) return state;
      return { ...state, busyEquipmentIds: [...state.busyEquipmentIds, action.equipmentId] };

    case 'releaseBusy':
      return { ...state, busyEquipmentIds: state.busyEquipmentIds.filter((id) => id !== action.equipmentId) };

    // 대체: 자리는 그대로, 변경 표시는 최초 운동 기준
    case 'substitute':
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === item.key
            ? {
                ...i,
                exerciseId: action.exerciseId,
                originalExerciseId: i.originalExerciseId ?? i.exerciseId,
              }
            : i,
        ),
        swapCount: state.swapCount + 1,
        lastSwappedKey: item.key,
      };

    case 'clearHighlight':
      return state.lastSwappedKey ? { ...state, lastSwappedKey: null } : state;

    default:
      return state;
  }
}
