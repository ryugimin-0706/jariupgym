import { describe, expect, it } from 'vitest';
import { EQUIPMENT_BY_ID, SELECTABLE_EQUIPMENT } from '../data/equipment.js';
import { EXERCISES, EXERCISES_BY_ID } from '../data/exercises.js';
import { PRESET_ROUTINES } from '../data/presetRoutines.js';
import { PATTERNS, TARGETS } from '../data/taxonomy.js';
import { buildReason, canMarkBusy, getSubstitutes, swapToastMessage } from './recommend.js';
import { adaptPresetRoutines } from './routine.js';

/** "대부분 있어요" = 맨몸 제외 전체 기구 */
const ALL_OWNED = SELECTABLE_EQUIPMENT.map((e) => e.id);
const ids = (suggestions) => suggestions.map((s) => s.exercise.id);

describe('데이터 무결성', () => {
  it('모든 운동이 존재하는 기구·타깃·패턴을 참조한다', () => {
    for (const ex of EXERCISES) {
      expect(EQUIPMENT_BY_ID[ex.equipmentId], ex.id).toBeDefined();
      expect(TARGETS[ex.target], ex.id).toBeDefined();
      expect(PATTERNS[ex.pattern], ex.id).toBeDefined();
    }
  });

  it('운동 id가 중복되지 않는다', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });

  it('추천 루틴의 모든 운동이 운동 목록에 있다', () => {
    for (const preset of PRESET_ROUTINES) {
      for (const id of preset.exerciseIds) expect(EXERCISES_BY_ID[id], id).toBeDefined();
    }
  });
});

describe('시나리오 A — 가슴 하는날, 바벨 벤치프레스 자리 없음', () => {
  const ctx = {
    ownedEquipmentIds: ALL_OWNED,
    busyEquipmentIds: ['bench'],
    excludeExerciseIds: ['barbell_bench_press', 'incline_dumbbell_press', 'cable_pushdown'],
  };

  it('덤벨 벤치프레스 → 스미스 벤치프레스 → 체스트프레스 순으로 추천한다 (동점이면 프리웨이트 우선)', () => {
    expect(ids(getSubstitutes('barbell_bench_press', ctx))).toEqual([
      'dumbbell_bench_press',
      'smith_bench_press',
      'chest_press',
    ]);
  });

  it('추천 이유 문구', () => {
    const [first] = getSubstitutes('barbell_bench_press', ctx);
    expect(first.reason).toBe('같은 가슴 운동 · 비어 있는 덤벨 사용 · 비슷한 수평 밀기 동작');
  });

  it('토스트 문구', () => {
    expect(swapToastMessage('dumbbell_bench_press')).toBe('루틴을 바꿨어요. 같은 가슴 운동이에요 💪');
  });
});

describe('후보 조건', () => {
  it('세부 타깃이 다르면 후보가 아니다 (스쿼트 → 레그 컬 X)', () => {
    const result = ids(getSubstitutes('barbell_back_squat', { ownedEquipmentIds: ALL_OWNED, busyEquipmentIds: ['rack'] }));
    expect(result).not.toContain('leg_curl');
    expect(result.every((id) => EXERCISES_BY_ID[id].target === 'quads')).toBe(true);
  });

  it('내 헬스장에 없는 기구의 운동은 제외한다', () => {
    const owned = ALL_OWNED.filter((id) => id !== 'dumbbell');
    const result = ids(getSubstitutes('barbell_bench_press', { ownedEquipmentIds: owned, busyEquipmentIds: ['bench'] }));
    expect(result.some((id) => EXERCISES_BY_ID[id].equipmentId === 'dumbbell')).toBe(false);
  });

  it("'사용 중' 기구의 운동은 제외한다", () => {
    const result = ids(
      getSubstitutes('barbell_bench_press', { ownedEquipmentIds: ALL_OWNED, busyEquipmentIds: ['bench', 'dumbbell'] }),
    );
    expect(result).toEqual(['smith_bench_press', 'chest_press', 'push_up']);
  });

  it('오늘 루틴에 있는 운동과 원래 운동은 제외한다', () => {
    const result = ids(
      getSubstitutes('barbell_bench_press', {
        ownedEquipmentIds: ALL_OWNED,
        busyEquipmentIds: ['bench'],
        excludeExerciseIds: ['dumbbell_bench_press'],
      }),
    );
    expect(result).not.toContain('dumbbell_bench_press');
    expect(result).not.toContain('barbell_bench_press');
  });

  it('맨몸 운동은 기구가 없어도 후보가 되지만 기구 운동보다 뒤에 온다', () => {
    const result = ids(
      getSubstitutes('barbell_bench_press', { ownedEquipmentIds: ['bench', 'chestpress'], busyEquipmentIds: ['bench'] }),
    );
    expect(result).toEqual(['chest_press', 'push_up']);
  });

  it('후보가 없으면 빈 배열', () => {
    expect(getSubstitutes('leg_curl', { ownedEquipmentIds: ['legcurl'], busyEquipmentIds: ['legcurl'] })).toEqual([]);
  });

  it('최대 3개', () => {
    expect(getSubstitutes('barbell_bench_press', { ownedEquipmentIds: ALL_OWNED, busyEquipmentIds: ['bench'] })).toHaveLength(3);
  });

  it('직접 입력이나 알 수 없는 운동은 빈 배열', () => {
    expect(getSubstitutes(null, { ownedEquipmentIds: ALL_OWNED })).toEqual([]);
  });
});

describe('추천 이유 문구', () => {
  const ex = EXERCISES_BY_ID;

  it('고립 패턴이면 동작 문구를 생략한다', () => {
    expect(buildReason(ex.cable_pushdown, ex.dumbbell_overhead_extension)).toBe('같은 팔 뒤쪽 운동 · 비어 있는 덤벨 사용');
  });

  it('패턴이 다르면 동작 문구를 생략한다', () => {
    expect(buildReason(ex.barbell_bench_press, ex.dumbbell_fly)).toBe('같은 가슴 운동 · 비어 있는 덤벨 사용');
  });

  it('맨몸은 "기구 없이 맨몸으로"', () => {
    expect(buildReason(ex.barbell_bench_press, ex.push_up)).toBe('같은 가슴 운동 · 기구 없이 맨몸으로 · 비슷한 수평 밀기 동작');
  });

  it('쉬운 부위 이름을 쓴다', () => {
    expect(buildReason(ex.barbell_back_squat, ex.smith_squat)).toBe(
      '같은 허벅지 앞 운동 · 비어 있는 스미스 머신 사용 · 비슷한 스쿼트 동작',
    );
    expect(swapToastMessage('leg_curl')).toBe('루틴을 바꿨어요. 같은 허벅지 뒤·엉덩이 운동이에요 💪');
  });
});

describe('자리 없음 버튼', () => {
  it('맨몸·직접 입력 운동은 자리 없음 불가', () => {
    expect(canMarkBusy('push_up')).toBe(false);
    expect(canMarkBusy(null)).toBe(false);
    expect(canMarkBusy('barbell_bench_press')).toBe(true);
  });
});

describe('시나리오 B — 스쿼트랙 해제 후 추천 루틴', () => {
  const owned = ALL_OWNED.filter((id) => id !== 'rack');
  const splits = adaptPresetRoutines(owned);
  const byName = Object.fromEntries(splits.map((s) => [s.name, s]));

  it('하체: 바벨 백스쿼트가 고블릿 스쿼트로 바뀌고 "내 헬스장 맞춤" 표시용 adaptedFrom이 붙는다', () => {
    const [first] = byName['하체'].exercises;
    expect(first.exerciseId).toBe('goblet_squat');
    expect(first.adaptedFrom).toBe('barbell_back_squat');
  });

  it('어깨: 바벨 오버헤드프레스(스쿼트랙)도 덤벨 숄더프레스로 바뀐다', () => {
    const [first] = byName['어깨'].exercises;
    expect(first.exerciseId).toBe('dumbbell_shoulder_press');
    expect(first.adaptedFrom).toBe('barbell_overhead_press');
  });

  it('기구가 있는 운동은 그대로', () => {
    expect(byName['가슴·삼두'].exercises.every((e) => !e.adaptedFrom)).toBe(true);
    expect(byName['하체'].exercises.map((e) => e.exerciseId)).toEqual([
      'goblet_squat',
      'leg_press',
      'leg_extension',
      'barbell_romanian_deadlift',
      'leg_curl',
    ]);
  });
});

describe('추천 루틴 — 대체 후보가 없을 때', () => {
  it('대체 후보가 없으면 빼고, 2개 미만이면 tooFew', () => {
    // 레그프레스만 있는 헬스장
    const legs = adaptPresetRoutines(['legpress']).find((s) => s.name === '하체');
    expect(legs.droppedExerciseIds).toContain('leg_curl');
    expect(legs.droppedExerciseIds).toContain('barbell_romanian_deadlift');
    expect(legs.exercises.every((e) => EXERCISES_BY_ID[e.exerciseId])).toBe(true);
    // 분할 안에서 같은 운동이 중복되지 않는다
    const exIds = legs.exercises.map((e) => e.exerciseId);
    expect(new Set(exIds).size).toBe(exIds.length);
    expect(legs.tooFew).toBe(exIds.length < 2);
  });

  it('기구가 하나도 없으면 맨몸 운동만 남는다', () => {
    const chest = adaptPresetRoutines([]).find((s) => s.name === '가슴·삼두');
    expect(chest.exercises.map((e) => e.exerciseId)).toEqual(['push_up', 'bench_dips']);
    expect(chest.tooFew).toBe(false);
  });
});
