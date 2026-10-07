/**
 * 운동 세션 상태 (화면 4·5). 저장된 내 루틴과 별개로, sessionStorage에만 임시 보관한다.
 *
 * items 배열 순서가 곧 화면 순서다.
 *  - 진행 중(pending) 운동이 위, 끝난(done/skipped) 운동이 아래
 *  - 모든 세트 완료·건너뜀 → 맨 아래로
 *  - 미루기·완료 취소·되돌리기 → 진행 중 운동들의 맨 뒤 (끝난 카드보다 위)
 *
 * 세트는 한 줄씩 무게·횟수를 적고 체크한다(setLog). 순서와 상관없이 체크할 수 있고,
 * 운동 중에 세트를 추가하거나 뺄 수 있다(저장된 루틴은 그대로).
 */
import { DEFAULT_COUNT, unitOf } from '../data/exercises.js';
import { makeId } from '../lib/routine.js';

/**
 * @typedef {'pending' | 'done' | 'skipped'} ItemStatus
 *
 * @typedef {Object} SetRow
 * @property {number | null} weight  kg (빈칸이면 null, 맨몸 등)
 * @property {number | null} reps    횟수 또는 초 (unitOf)
 * @property {boolean} done
 *
 * @typedef {Object} WorkoutItem
 * @property {string} key
 * @property {string | null} exerciseId   null이면 직접 입력
 * @property {string} [customName]
 * @property {SetRow[]} setLog
 * @property {ItemStatus} status
 * @property {string | null} originalExerciseId 대체된 경우 최초 운동 id
 * @property {string[]} swapChain          지금 운동 이전에 거쳐 온 운동 id들 (오래된 순, 최초 운동 포함)
 *
 * @typedef {Object} WorkoutState
 * @property {string} splitId
 * @property {string} splitName
 * @property {WorkoutItem[]} items
 * @property {string[]} busyEquipmentIds
 * @property {number} swapCount            대체 횟수 (미루기·건너뛰기 제외)
 * @property {string | null} lastSwappedKey 하이라이트 애니메이션용
 */

export const MAX_SETS_IN_WORKOUT = 20;

/** @returns {SetRow} */
const newRow = (exerciseId) => ({ weight: null, reps: DEFAULT_COUNT[unitOf(exerciseId)], done: false });

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
      setLog: Array.from({ length: e.sets }, () => newRow(e.exerciseId)),
      status: 'pending',
      originalExerciseId: null,
      swapChain: [],
    })),
    busyEquipmentIds: [],
    swapCount: 0,
    lastSwappedKey: null,
  };
}

/**
 * 세트 줄. 세트 줄이 없던 예전 세션(sets·doneSets)도 읽을 수 있게 변환한다.
 * @param {WorkoutItem & { sets?: number, doneSets?: number }} item
 * @returns {SetRow[]}
 */
export function setLogOf(item) {
  if (Array.isArray(item.setLog)) return item.setLog;
  const sets = item.sets ?? 1;
  const doneSets = typeof item.doneSets === 'number' ? item.doneSets : item.status === 'done' ? sets : 0;
  return Array.from({ length: sets }, (_, i) => ({ ...newRow(item.exerciseId), done: i < doneSets }));
}

export const doneSetsOf = (item) => setLogOf(item).filter((r) => r.done).length;

/** 끝낸 세트의 무게 × 횟수 합 (시간으로 하는 운동·무게 없는 세트는 0) */
export function volumeOf(item) {
  if (unitOf(item.exerciseId) !== 'reps') return 0;
  return setLogOf(item).reduce((sum, r) => sum + (r.done && r.weight && r.reps ? r.weight * r.reps : 0), 0);
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

/** 같은 자리에서 고친다 */
const patchItem = (items, key, patch) => items.map((i) => (i.key === key ? { ...i, ...patch } : i));

/**
 * 세트 줄을 바꾼 뒤 상태를 맞춘다: 모두 체크되면 완료(맨 아래), 완료였는데 체크가 풀리면 진행 중으로.
 */
function withSetLog(state, item, setLog) {
  const allDone = setLog.length > 0 && setLog.every((r) => r.done);
  if (isPending(item) && allDone) return { ...state, items: moveToEnd(state.items, item.key, { setLog, status: 'done' }) };
  if (item.status === 'done' && !allDone) {
    return { ...state, items: moveToPendingEnd(state.items, item.key, { setLog, status: 'pending' }) };
  }
  return { ...state, items: patchItem(state.items, item.key, { setLog }) };
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

/**
 * 지금 운동 이전에 거쳐 온 운동 id들 (오래된 순).
 * swapChain이 없던 예전 세션은 최초 운동만 돌려준다.
 * @param {WorkoutItem} item
 */
export function swapChainOf(item) {
  if (item.swapChain) return item.swapChain;
  return item.originalExerciseId ? [item.originalExerciseId] : [];
}

export function progress(state) {
  const total = state.items.length;
  const done = state.items.filter((i) => i.status === 'done').length;
  const skipped = state.items.filter((i) => i.status === 'skipped').length;
  const doneSets = state.items.reduce((n, i) => n + doneSetsOf(i), 0);
  const volume = state.items.reduce((n, i) => n + volumeOf(i), 0);
  return { total, done, skipped, doneSets, volume, finished: total > 0 && done + skipped === total };
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
  const log = item ? setLogOf(item) : [];

  switch (action.type) {
    // 세트 하나 체크 ⇄ 해제 (순서 상관없음)
    case 'toggleSet': {
      if (item.status === 'skipped' || !log[action.index]) return state;
      return withSetLog(
        state,
        item,
        log.map((r, i) => (i === action.index ? { ...r, done: !r.done } : r)),
      );
    }

    // 무게·횟수 고치기 (끝낸 세트도 고칠 수 있다).
    // 아래쪽의 체크 안 한 세트 중 고치기 전 값과 같던 세트에도 같은 값을 채운다
    // (60kg을 한 번 적으면 남은 세트도 60kg, 따로 적은 세트는 그대로).
    case 'updateSet': {
      const target = log[action.index];
      if (!target) return state;
      const patchRow = (r, field) => {
        if (action[field] === undefined) return r;
        return { ...r, [field]: action[field] };
      };
      return withSetLog(
        state,
        item,
        log.map((r, i) => {
          if (i === action.index) return patchRow(patchRow(r, 'weight'), 'reps');
          if (i < action.index || r.done) return r;
          let next = r;
          if (action.weight !== undefined && r.weight === target.weight) next = patchRow(next, 'weight');
          if (action.reps !== undefined && r.reps === target.reps) next = patchRow(next, 'reps');
          return next;
        }),
      );
    }

    // 마지막으로 체크한 세트 취소 (완료 카드를 탭했을 때)
    case 'undoSet': {
      const last = log.map((r) => r.done).lastIndexOf(true);
      if (last === -1 || item.status === 'skipped') return state;
      return withSetLog(
        state,
        item,
        log.map((r, i) => (i === last ? { ...r, done: false } : r)),
      );
    }

    // 세트 추가: 마지막 세트의 무게·횟수를 복사
    case 'addSet': {
      if (!isPending(item) || log.length >= MAX_SETS_IN_WORKOUT) return state;
      const last = log.at(-1) ?? newRow(item.exerciseId);
      return withSetLog(state, item, [...log, { weight: last.weight, reps: last.reps, done: false }]);
    }

    // 세트 빼기: 마지막 세트가 체크되지 않았을 때만, 최소 1세트
    case 'removeSet': {
      if (!isPending(item) || log.length <= 1 || log.at(-1).done) return state;
      return withSetLog(state, item, log.slice(0, -1));
    }

    // 지난 기록 불러오기: 체크하지 않은 세트에 채우고, 지난 기록이 더 길면 세트를 늘린다
    case 'loadSets': {
      if (!isPending(item) || !action.rows?.length) return state;
      const length = Math.max(log.length, action.rows.length);
      const next = Array.from({ length }, (_, i) => {
        const row = log[i];
        const prev = action.rows[i];
        if (row?.done || !prev) return row;
        return { weight: prev.weight ?? null, reps: prev.reps ?? row?.reps ?? null, done: false };
      });
      return withSetLog(state, item, next);
    }

    // 건너뛴 운동을 다시 진행 중으로 (기록은 유지)
    case 'restore':
      if (item.status !== 'skipped') return state;
      return { ...state, items: moveToPendingEnd(state.items, item.key, { status: 'pending' }) };

    case 'skip':
      return { ...state, items: moveToEnd(state.items, item.key, { status: 'skipped' }) };

    case 'defer':
      return { ...state, items: moveToPendingEnd(state.items, item.key, { status: 'pending' }) };

    case 'markBusy':
      if (state.busyEquipmentIds.includes(action.equipmentId)) return state;
      return { ...state, busyEquipmentIds: [...state.busyEquipmentIds, action.equipmentId] };

    case 'releaseBusy':
      return { ...state, busyEquipmentIds: state.busyEquipmentIds.filter((id) => id !== action.equipmentId) };

    // 대체: 자리 유지, 끝낸 세트는 기록 그대로, 남은 세트는 횟수만 이어가고 무게는 비운다.
    // 횟수↔초 단위가 바뀌면 남은 세트는 새 운동의 기본값으로.
    case 'substitute': {
      const sameUnit = unitOf(item.exerciseId) === unitOf(action.exerciseId);
      const setLog = log.map((r) =>
        r.done ? r : { weight: null, reps: sameUnit ? r.reps : DEFAULT_COUNT[unitOf(action.exerciseId)], done: false },
      );
      return {
        ...state,
        items: patchItem(state.items, item.key, {
          exerciseId: action.exerciseId,
          setLog,
          originalExerciseId: item.originalExerciseId ?? item.exerciseId,
          swapChain: [...swapChainOf(item), item.exerciseId],
        }),
        swapCount: state.swapCount + 1,
        lastSwappedKey: item.key,
      };
    }

    case 'clearHighlight':
      return state.lastSwappedKey ? { ...state, lastSwappedKey: null } : state;

    default:
      return state;
  }
}

/**
 * 끝난 운동의 기록을 운동별 마지막 기록에 합친다 (체크한 세트만, 직접 입력 운동 제외).
 * @param {Record<string, { weight: number | null, reps: number | null }[]>} lastLogs
 * @param {WorkoutState} state
 */
export function mergeLastLogs(lastLogs, state) {
  const next = { ...lastLogs };
  for (const item of state.items) {
    const done = setLogOf(item).filter((r) => r.done);
    if (item.exerciseId && done.length) next[item.exerciseId] = done.map(({ weight, reps }) => ({ weight, reps }));
  }
  return next;
}
