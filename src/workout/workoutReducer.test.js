import { describe, expect, it } from 'vitest';
import {
  doneSetsOf,
  mergeLastLogs,
  progress,
  setLogOf,
  swapChainOf,
  todayExerciseIds,
  volumeOf,
  workoutReducer,
} from './workoutReducer.js';

const split = {
  id: 'split_1',
  name: '가슴 하는날',
  exercises: [
    { id: 'e1', exerciseId: 'barbell_bench_press', sets: 3 },
    { id: 'e2', exerciseId: 'incline_dumbbell_press', sets: 3 },
    { id: 'e3', exerciseId: 'cable_pushdown', sets: 4 },
    { id: 'e4', exerciseId: null, customName: '랜드마인 프레스', sets: 3 },
  ],
};

const start = () => workoutReducer(null, { type: 'start', split });
const order = (state) => state.items.map((i) => i.exerciseId ?? i.customName);
const find = (state, name) => state.items.find((i) => (i.exerciseId ?? i.customName) === name);
const keyOf = (state, name) => find(state, name).key;
const act = (state, type, name, extra = {}) => workoutReducer(state, { type, key: keyOf(state, name), ...extra });
const toggle = (state, name, index) => act(state, 'toggleSet', name, { index });
/** 모든 세트를 체크한다 */
const finish = (state, name) => {
  let s = state;
  find(s, name).setLog.forEach((r, i) => {
    if (!r.done) s = toggle(s, name, i);
  });
  return s;
};

describe('운동 세션 reducer — 세트 줄', () => {
  it('분할로 시작하면 세트 수만큼 빈 줄(무게 없음, 10회)', () => {
    const s = start();
    expect(s.splitName).toBe('가슴 하는날');
    expect(find(s, 'barbell_bench_press').setLog).toEqual([
      { weight: null, reps: 10, done: false },
      { weight: null, reps: 10, done: false },
      { weight: null, reps: 10, done: false },
    ]);
    expect(find(s, 'cable_pushdown').setLog).toHaveLength(4);
    expect(progress(s)).toEqual({ total: 4, done: 0, skipped: 0, doneSets: 0, volume: 0, finished: false });
  });

  it('플랭크는 초 단위 기본값(30초)', () => {
    const s = workoutReducer(null, {
      type: 'start',
      split: { id: 's', name: '복근', exercises: [{ id: 'p', exerciseId: 'plank', sets: 2 }] },
    });
    expect(s.items[0].setLog[0].reps).toBe(30);
  });

  it('값을 고치면 아래쪽의 체크 안 한 세트 중 같은 값이던 세트에도 채운다', () => {
    let s = start();
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 0, weight: 60 });
    expect(find(s, 'barbell_bench_press').setLog.map((r) => r.weight)).toEqual([60, 60, 60]);
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 2, weight: 70 });
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 0, weight: 65, reps: 8 });
    // 2세트는 60(같은 값)이라 65로, 3세트는 따로 적은 70이라 그대로. 횟수도 같은 규칙
    expect(find(s, 'barbell_bench_press').setLog.map((r) => [r.weight, r.reps])).toEqual([
      [65, 8],
      [65, 8],
      [70, 8],
    ]);
    // 체크한 세트와 위쪽 세트는 바뀌지 않는다
    s = toggle(s, 'barbell_bench_press', 2);
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 1, weight: 80 });
    expect(find(s, 'barbell_bench_press').setLog.map((r) => r.weight)).toEqual([65, 80, 70]);
  });

  it('무게·횟수를 고치고 체크하면 기록된다, 순서 상관없이 체크', () => {
    let s = start();
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 1, weight: 60, reps: 8 });
    s = toggle(s, 'barbell_bench_press', 1);
    expect(find(s, 'barbell_bench_press').setLog[1]).toEqual({ weight: 60, reps: 8, done: true });
    expect(doneSetsOf(find(s, 'barbell_bench_press'))).toBe(1);
    expect(find(s, 'barbell_bench_press').status).toBe('pending');
    // 다시 누르면 해제
    s = toggle(s, 'barbell_bench_press', 1);
    expect(doneSetsOf(find(s, 'barbell_bench_press'))).toBe(0);
  });

  it('모든 세트를 체크하면 운동 완료 → 맨 아래로, 하나 풀면 진행 중 운동들의 맨 뒤로', () => {
    let s = start();
    s = finish(s, 'barbell_bench_press');
    expect(find(s, 'barbell_bench_press').status).toBe('done');
    expect(order(s)).toEqual(['incline_dumbbell_press', 'cable_pushdown', '랜드마인 프레스', 'barbell_bench_press']);
    s = finish(s, 'incline_dumbbell_press');
    s = toggle(s, 'barbell_bench_press', 0);
    expect(find(s, 'barbell_bench_press').status).toBe('pending');
    expect(order(s)).toEqual(['cable_pushdown', '랜드마인 프레스', 'barbell_bench_press', 'incline_dumbbell_press']);
  });

  it('undoSet: 마지막으로 체크한 세트를 해제 (완료 카드 탭)', () => {
    let s = start();
    s = finish(s, 'barbell_bench_press');
    s = act(s, 'undoSet', 'barbell_bench_press');
    expect(find(s, 'barbell_bench_press').setLog.map((r) => r.done)).toEqual([true, true, false]);
    expect(find(s, 'barbell_bench_press').status).toBe('pending');
  });

  it('세트 추가: 마지막 세트 값을 복사, 완료됐던 운동은 그대로', () => {
    let s = start();
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 2, weight: 70, reps: 6 });
    s = act(s, 'addSet', 'barbell_bench_press');
    expect(find(s, 'barbell_bench_press').setLog.at(-1)).toEqual({ weight: 70, reps: 6, done: false });
    expect(find(s, 'barbell_bench_press').setLog).toHaveLength(4);
  });

  it('세트 빼기: 마지막 세트가 체크 안 됐을 때만, 최소 1세트. 남은 세트가 모두 체크면 완료', () => {
    let s = start();
    s = toggle(s, 'barbell_bench_press', 0);
    s = toggle(s, 'barbell_bench_press', 1);
    s = act(s, 'removeSet', 'barbell_bench_press');
    // 3세트 중 2세트 끝낸 상태에서 마지막 세트를 빼면 완료
    expect(find(s, 'barbell_bench_press')).toMatchObject({ status: 'done' });
    expect(find(s, 'barbell_bench_press').setLog).toHaveLength(2);

    let t = start();
    t = toggle(t, 'incline_dumbbell_press', 2);
    expect(act(t, 'removeSet', 'incline_dumbbell_press')).toBe(t); // 마지막 세트가 체크돼 있으면 그대로
    t = act(t, 'removeSet', 'cable_pushdown');
    t = act(t, 'removeSet', 'cable_pushdown');
    t = act(t, 'removeSet', 'cable_pushdown');
    expect(find(t, 'cable_pushdown').setLog).toHaveLength(1);
    expect(act(t, 'removeSet', 'cable_pushdown')).toBe(t);
  });

  it('지난 기록 불러오기: 체크 안 한 세트만 채우고, 지난 기록이 길면 세트를 늘린다', () => {
    let s = start();
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 0, weight: 50, reps: 12 });
    s = toggle(s, 'barbell_bench_press', 0);
    s = act(s, 'loadSets', 'barbell_bench_press', {
      rows: [
        { weight: 60, reps: 10 },
        { weight: 65, reps: 8 },
        { weight: 70, reps: 6 },
        { weight: 70, reps: 5 },
      ],
    });
    expect(find(s, 'barbell_bench_press').setLog).toEqual([
      { weight: 50, reps: 12, done: true },
      { weight: 65, reps: 8, done: false },
      { weight: 70, reps: 6, done: false },
      { weight: 70, reps: 5, done: false },
    ]);
  });

  it('미루기·건너뛰기·되돌리기는 기록을 유지', () => {
    let s = start();
    s = finish(s, 'cable_pushdown');
    s = toggle(s, 'barbell_bench_press', 0);
    s = act(s, 'defer', 'barbell_bench_press');
    expect(order(s)).toEqual(['incline_dumbbell_press', '랜드마인 프레스', 'barbell_bench_press', 'cable_pushdown']);
    expect(doneSetsOf(find(s, 'barbell_bench_press'))).toBe(1);

    s = toggle(s, '랜드마인 프레스', 0);
    s = act(s, 'skip', '랜드마인 프레스');
    expect(s.items.at(-1).status).toBe('skipped');
    expect(toggle(s, '랜드마인 프레스', 1)).toBe(s); // 건너뛴 운동은 체크 불가
    s = act(s, 'restore', '랜드마인 프레스');
    expect(find(s, '랜드마인 프레스')).toMatchObject({ status: 'pending' });
    expect(doneSetsOf(find(s, '랜드마인 프레스'))).toBe(1);
  });

  it('모두 완료하거나 건너뛰면 finished, 총 세트·볼륨 집계', () => {
    let s = start();
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 0, weight: 60, reps: 10 });
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 1, weight: 60, reps: 8 });
    for (const name of ['barbell_bench_press', 'incline_dumbbell_press', 'cable_pushdown']) s = finish(s, name);
    expect(progress(s).finished).toBe(false);
    s = act(s, 'skip', '랜드마인 프레스');
    // 1세트 60kg×10 → 2·3세트도 60kg. 2세트를 8회로 → 3세트도 8회. 볼륨: 600 + 480 + 480 (무게가 빈 세트는 0)
    expect(progress(s)).toEqual({ total: 4, done: 3, skipped: 1, doneSets: 10, volume: 1560, finished: true });
  });

  it('사용 중 표시와 해제 (중복 없음)', () => {
    let s = start();
    s = workoutReducer(s, { type: 'markBusy', equipmentId: 'bench' });
    s = workoutReducer(s, { type: 'markBusy', equipmentId: 'bench' });
    expect(s.busyEquipmentIds).toEqual(['bench']);
    s = workoutReducer(s, { type: 'releaseBusy', equipmentId: 'bench' });
    expect(s.busyEquipmentIds).toEqual([]);
  });

  it('대체: 끝낸 세트는 기록 그대로, 남은 세트는 횟수만 이어가고 무게는 비운다', () => {
    let s = start();
    const key = keyOf(s, 'barbell_bench_press');
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 0, weight: 60, reps: 10 });
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 1, weight: 60, reps: 8 });
    s = toggle(s, 'barbell_bench_press', 0);
    s = workoutReducer(s, { type: 'substitute', key, exerciseId: 'dumbbell_bench_press' });
    s = workoutReducer(s, { type: 'substitute', key, exerciseId: 'chest_press' });
    expect(s.items[0]).toMatchObject({
      exerciseId: 'chest_press',
      originalExerciseId: 'barbell_bench_press',
      swapChain: ['barbell_bench_press', 'dumbbell_bench_press'],
    });
    // 3세트도 2세트 값(8회)이 이어진 상태였다. 무게는 비운다
    expect(s.items[0].setLog).toEqual([
      { weight: 60, reps: 10, done: true },
      { weight: null, reps: 8, done: false },
      { weight: null, reps: 8, done: false },
    ]);
    expect(s.swapCount).toBe(2);
    expect(s.lastSwappedKey).toBe(key);
    expect(todayExerciseIds(s).has('barbell_bench_press')).toBe(true);
  });

  it('대체로 횟수↔초 단위가 바뀌면 남은 세트는 새 기본값', () => {
    let s = workoutReducer(null, {
      type: 'start',
      split: { id: 's', name: '복근', exercises: [{ id: 'c', exerciseId: 'crunch', sets: 2 }] },
    });
    s = workoutReducer(s, { type: 'substitute', key: s.items[0].key, exerciseId: 'plank' });
    expect(s.items[0].setLog.map((r) => r.reps)).toEqual([30, 30]);
    expect(volumeOf(s.items[0])).toBe(0);
  });

  it('없는 key는 무시, 종료하면 null', () => {
    const s = start();
    expect(workoutReducer(s, { type: 'skip', key: 'nope' })).toBe(s);
    expect(workoutReducer(s, { type: 'end' })).toBeNull();
  });

  it('예전 세션 호환: setLog·swapChain이 없어도 동작한다', () => {
    expect(swapChainOf({ originalExerciseId: 'barbell_bench_press' })).toEqual(['barbell_bench_press']);
    expect(swapChainOf({ originalExerciseId: null })).toEqual([]);
    const old = { exerciseId: 'barbell_bench_press', sets: 3, doneSets: 2, status: 'pending' };
    expect(setLogOf(old).map((r) => r.done)).toEqual([true, true, false]);
    expect(doneSetsOf({ exerciseId: 'push_up', sets: 2, status: 'done' })).toBe(2);
  });

  it('운동별 마지막 기록: 체크한 세트만, 직접 입력 운동은 제외, 다른 운동 기록은 유지', () => {
    let s = start();
    s = act(s, 'updateSet', 'barbell_bench_press', { index: 0, weight: 60, reps: 10 });
    s = toggle(s, 'barbell_bench_press', 0);
    s = toggle(s, '랜드마인 프레스', 0);
    const merged = mergeLastLogs({ leg_press: [{ weight: 100, reps: 12 }] }, s);
    expect(merged).toEqual({
      leg_press: [{ weight: 100, reps: 12 }],
      barbell_bench_press: [{ weight: 60, reps: 10 }],
    });
  });
});
