import { describe, expect, it } from 'vitest';
import { doneSetsOf, progress, swapChainOf, todayExerciseIds, workoutReducer } from './workoutReducer.js';

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
/** 모든 세트를 끝낸다 */
const finish = (state, name) => {
  let s = state;
  while (find(s, name).status === 'pending') s = act(s, 'completeSet', name);
  return s;
};

describe('운동 세션 reducer', () => {
  it('분할로 시작하면 모든 운동이 진행 중, 0세트', () => {
    const s = start();
    expect(s.splitName).toBe('가슴 하는날');
    expect(s.items.every((i) => i.status === 'pending' && i.doneSets === 0)).toBe(true);
    expect(s.items[3].customName).toBe('랜드마인 프레스');
    expect(progress(s)).toEqual({ total: 4, done: 0, skipped: 0, doneSets: 0, finished: false });
  });

  it('한 세트씩 완료하고, 마지막 세트에서 운동 완료 → 맨 아래로', () => {
    let s = start();
    s = act(s, 'completeSet', 'barbell_bench_press');
    s = act(s, 'completeSet', 'barbell_bench_press');
    expect(find(s, 'barbell_bench_press')).toMatchObject({ status: 'pending', doneSets: 2 });
    expect(order(s)[0]).toBe('barbell_bench_press');
    s = act(s, 'completeSet', 'barbell_bench_press');
    expect(find(s, 'barbell_bench_press')).toMatchObject({ status: 'done', doneSets: 3 });
    expect(order(s)).toEqual(['incline_dumbbell_press', 'cable_pushdown', '랜드마인 프레스', 'barbell_bench_press']);
    expect(progress(s).doneSets).toBe(3);
  });

  it('세트 취소: 진행 중이면 한 세트 줄고, 완료였으면 마지막 세트를 되돌려 진행 중 운동들의 맨 뒤로', () => {
    let s = start();
    s = act(s, 'completeSet', 'incline_dumbbell_press');
    s = act(s, 'undoSet', 'incline_dumbbell_press');
    expect(find(s, 'incline_dumbbell_press').doneSets).toBe(0);
    expect(act(s, 'undoSet', 'incline_dumbbell_press')).toBe(s); // 0세트에서는 그대로

    s = finish(s, 'barbell_bench_press');
    s = finish(s, 'incline_dumbbell_press');
    s = act(s, 'undoSet', 'barbell_bench_press');
    expect(find(s, 'barbell_bench_press')).toMatchObject({ status: 'pending', doneSets: 2 });
    // 완료 카드(인클라인)보다 위
    expect(order(s)).toEqual(['cable_pushdown', '랜드마인 프레스', 'barbell_bench_press', 'incline_dumbbell_press']);
  });

  it('미루기: 끝낸 세트 수는 그대로, 진행 중 운동들의 맨 뒤 (완료 카드보다 위)', () => {
    let s = start();
    s = finish(s, 'cable_pushdown');
    s = act(s, 'completeSet', 'barbell_bench_press');
    s = act(s, 'defer', 'barbell_bench_press');
    expect(order(s)).toEqual(['incline_dumbbell_press', '랜드마인 프레스', 'barbell_bench_press', 'cable_pushdown']);
    expect(find(s, 'barbell_bench_press').doneSets).toBe(1);
  });

  it('건너뛰기: 맨 아래로, 끝낸 세트 수는 남고, 되돌리면 진행 중으로', () => {
    let s = start();
    s = act(s, 'completeSet', '랜드마인 프레스');
    s = act(s, 'skip', '랜드마인 프레스');
    expect(s.items.at(-1)).toMatchObject({ status: 'skipped', doneSets: 1 });
    expect(progress(s)).toMatchObject({ skipped: 1, doneSets: 1 });
    s = act(s, 'restore', '랜드마인 프레스');
    expect(find(s, '랜드마인 프레스')).toMatchObject({ status: 'pending', doneSets: 1 });
  });

  it('모두 완료하거나 건너뛰면 finished, 총 세트 수 집계', () => {
    let s = start();
    for (const name of ['barbell_bench_press', 'incline_dumbbell_press', 'cable_pushdown']) s = finish(s, name);
    expect(progress(s).finished).toBe(false);
    s = act(s, 'skip', '랜드마인 프레스');
    expect(progress(s)).toEqual({ total: 4, done: 3, skipped: 1, doneSets: 10, finished: true });
  });

  it('사용 중 표시와 해제 (중복 없음)', () => {
    let s = start();
    s = workoutReducer(s, { type: 'markBusy', equipmentId: 'bench' });
    s = workoutReducer(s, { type: 'markBusy', equipmentId: 'bench' });
    expect(s.busyEquipmentIds).toEqual(['bench']);
    s = workoutReducer(s, { type: 'releaseBusy', equipmentId: 'bench' });
    expect(s.busyEquipmentIds).toEqual([]);
  });

  it('대체: 자리 유지, 끝낸 세트 수 이어감, 최초 운동 기준 표시, 대체 횟수만 센다', () => {
    let s = start();
    const key = keyOf(s, 'barbell_bench_press');
    s = act(s, 'completeSet', 'barbell_bench_press');
    s = workoutReducer(s, { type: 'substitute', key, exerciseId: 'dumbbell_bench_press' });
    s = workoutReducer(s, { type: 'substitute', key, exerciseId: 'chest_press' });
    s = act(s, 'defer', 'cable_pushdown');
    expect(s.items[0]).toMatchObject({
      exerciseId: 'chest_press',
      doneSets: 1,
      originalExerciseId: 'barbell_bench_press',
      swapChain: ['barbell_bench_press', 'dumbbell_bench_press'],
    });
    // 남은 2세트만 하면 완료
    s = act(s, 'completeSet', 'chest_press');
    s = act(s, 'completeSet', 'chest_press');
    expect(find(s, 'chest_press').status).toBe('done');
    expect(s.swapCount).toBe(2);
    expect(s.lastSwappedKey).toBe(key);
    // 대체 후보 조건 4: 원래 운동도 오늘 루틴으로 본다
    expect(todayExerciseIds(s).has('barbell_bench_press')).toBe(true);
    expect(todayExerciseIds(s).has('chest_press')).toBe(true);
  });

  it('없는 key는 무시, 종료하면 null', () => {
    const s = start();
    expect(workoutReducer(s, { type: 'skip', key: 'nope' })).toBe(s);
    expect(workoutReducer(s, { type: 'end' })).toBeNull();
  });

  it('예전 세션 호환: swapChain·doneSets가 없어도 동작한다', () => {
    expect(swapChainOf({ originalExerciseId: 'barbell_bench_press' })).toEqual(['barbell_bench_press']);
    expect(swapChainOf({ originalExerciseId: null })).toEqual([]);
    expect(doneSetsOf({ status: 'done', sets: 3 })).toBe(3);
    expect(doneSetsOf({ status: 'pending', sets: 3 })).toBe(0);
  });
});
