import { describe, expect, it } from 'vitest';
import { progress, todayExerciseIds, workoutReducer } from './workoutReducer.js';

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
const keyOf = (state, exerciseId) => state.items.find((i) => (i.exerciseId ?? i.customName) === exerciseId).key;

describe('운동 세션 reducer', () => {
  it('분할로 시작하면 모든 운동이 진행 중', () => {
    const s = start();
    expect(s.splitName).toBe('가슴 하는날');
    expect(s.items.every((i) => i.status === 'pending')).toBe(true);
    expect(s.items[3].customName).toBe('랜드마인 프레스');
    expect(progress(s)).toEqual({ total: 4, done: 0, skipped: 0, finished: false });
  });

  it('완료하면 맨 아래로, 다시 탭하면 진행 중 운동들의 맨 뒤로', () => {
    let s = start();
    s = workoutReducer(s, { type: 'toggleDone', key: keyOf(s, 'barbell_bench_press') });
    expect(order(s)).toEqual(['incline_dumbbell_press', 'cable_pushdown', '랜드마인 프레스', 'barbell_bench_press']);
    s = workoutReducer(s, { type: 'toggleDone', key: keyOf(s, 'incline_dumbbell_press') });
    // 취소: 완료 카드들보다 위
    s = workoutReducer(s, { type: 'toggleDone', key: keyOf(s, 'barbell_bench_press') });
    expect(order(s)).toEqual(['cable_pushdown', '랜드마인 프레스', 'barbell_bench_press', 'incline_dumbbell_press']);
    expect(s.items[2].status).toBe('pending');
  });

  it('미루기: 진행 중 운동들의 맨 뒤 (완료 카드보다 위)', () => {
    let s = start();
    s = workoutReducer(s, { type: 'toggleDone', key: keyOf(s, 'cable_pushdown') });
    s = workoutReducer(s, { type: 'defer', key: keyOf(s, 'barbell_bench_press') });
    expect(order(s)).toEqual(['incline_dumbbell_press', '랜드마인 프레스', 'barbell_bench_press', 'cable_pushdown']);
  });

  it('건너뛰기: 맨 아래로, 다시 탭하면 진행 중으로', () => {
    let s = start();
    s = workoutReducer(s, { type: 'skip', key: keyOf(s, '랜드마인 프레스') });
    expect(s.items.at(-1).status).toBe('skipped');
    expect(progress(s).skipped).toBe(1);
    s = workoutReducer(s, { type: 'toggleDone', key: keyOf(s, '랜드마인 프레스') });
    expect(s.items.find((i) => i.customName).status).toBe('pending');
  });

  it('모두 완료하거나 건너뛰면 finished', () => {
    let s = start();
    for (const id of ['barbell_bench_press', 'incline_dumbbell_press', 'cable_pushdown']) {
      s = workoutReducer(s, { type: 'toggleDone', key: keyOf(s, id) });
    }
    expect(progress(s).finished).toBe(false);
    s = workoutReducer(s, { type: 'skip', key: keyOf(s, '랜드마인 프레스') });
    expect(progress(s)).toEqual({ total: 4, done: 3, skipped: 1, finished: true });
  });

  it('사용 중 표시와 해제 (중복 없음)', () => {
    let s = start();
    s = workoutReducer(s, { type: 'markBusy', equipmentId: 'bench' });
    s = workoutReducer(s, { type: 'markBusy', equipmentId: 'bench' });
    expect(s.busyEquipmentIds).toEqual(['bench']);
    s = workoutReducer(s, { type: 'releaseBusy', equipmentId: 'bench' });
    expect(s.busyEquipmentIds).toEqual([]);
  });

  it('대체: 자리 유지, 최초 운동 기준 표시, 대체 횟수만 센다', () => {
    let s = start();
    const key = keyOf(s, 'barbell_bench_press');
    s = workoutReducer(s, { type: 'substitute', key, exerciseId: 'dumbbell_bench_press' });
    s = workoutReducer(s, { type: 'substitute', key, exerciseId: 'chest_press' });
    s = workoutReducer(s, { type: 'defer', key: keyOf(s, 'cable_pushdown') });
    expect(s.items[0]).toMatchObject({ exerciseId: 'chest_press', originalExerciseId: 'barbell_bench_press' });
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
});
