import { describe, expect, it } from 'vitest';
import { EQUIPMENT_BY_ID, EQUIPMENT_GROUPS, SELECTABLE_EQUIPMENT } from '../data/equipment.js';
import { EQUIPMENT_INFO } from '../data/equipmentInfo.js';
import { EXERCISE_GUIDES, videoSearchUrl } from '../data/exerciseGuides.js';
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

  it('모든 세부 타깃에 운동이 2개 이상 있다 (대체 후보가 생길 수 있도록)', () => {
    for (const target of Object.keys(TARGETS)) {
      expect(EXERCISES.filter((e) => e.target === target).length, target).toBeGreaterThanOrEqual(2);
    }
  });

  it('선택할 수 있는 모든 기구를 쓰는 운동이 있다', () => {
    for (const eq of SELECTABLE_EQUIPMENT) {
      expect(EXERCISES.some((e) => e.equipmentId === eq.id), eq.id).toBe(true);
    }
  });

  it('선택할 수 있는 모든 기구가 기구 등록 묶음 중 정확히 하나에 들어 있다', () => {
    const grouped = EQUIPMENT_GROUPS.flatMap((g) => g.equipmentIds);
    expect([...grouped].sort()).toEqual(SELECTABLE_EQUIPMENT.map((e) => e.id).sort());
  });

  it('모든 운동에 운동 방법(3단계 + 주의점)이 있고, 없는 운동의 설명은 없다', () => {
    for (const ex of EXERCISES) {
      const guide = EXERCISE_GUIDES[ex.id];
      expect(guide, ex.id).toBeDefined();
      expect(guide.steps, ex.id).toHaveLength(3);
      expect(guide.caution.length, ex.id).toBeGreaterThan(0);
    }
    expect(Object.keys(EXERCISE_GUIDES).filter((id) => !EXERCISES_BY_ID[id])).toEqual([]);
  });

  it('선택할 수 있는 모든 기구에 생김새 설명이 있고, 사진에는 출처 정보가 모두 있다', () => {
    for (const eq of SELECTABLE_EQUIPMENT) {
      const info = EQUIPMENT_INFO[eq.id];
      expect(info?.look, eq.id).toBeTruthy();
      if (info.photo) {
        for (const field of ['src', 'author', 'license', 'licenseUrl', 'sourceUrl']) {
          expect(info.photo[field], `${eq.id}.photo.${field}`).toBeTruthy();
        }
      }
    }
  });

  it('영상 검색 주소', () => {
    expect(videoSearchUrl('덤벨 컬')).toBe('https://www.youtube.com/results?search_query=%EB%8D%A4%EB%B2%A8%20%EC%BB%AC%20%EC%9E%90%EC%84%B8');
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

  it('덤벨 벤치프레스 → 인클라인 바벨 벤치프레스 → 스미스 벤치프레스 순으로 추천한다 (동점이면 프리웨이트 우선)', () => {
    expect(ids(getSubstitutes('barbell_bench_press', ctx))).toEqual([
      'dumbbell_bench_press',
      'incline_barbell_bench_press',
      'smith_bench_press',
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
    expect(result).toEqual(['incline_barbell_bench_press', 'smith_bench_press', 'chest_press']);
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
    expect(swapToastMessage('leg_curl')).toBe('루틴을 바꿨어요. 같은 허벅지 뒤 운동이에요 💪');
    expect(swapToastMessage('hip_thrust_machine')).toBe('루틴을 바꿨어요. 같은 엉덩이 운동이에요 💪');
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

describe('추천 루틴 — 복근 분할', () => {
  it('기구가 다 있으면 그대로', () => {
    const abs = adaptPresetRoutines(ALL_OWNED).find((s) => s.name === '복근');
    expect(abs.exercises.map((e) => e.exerciseId)).toEqual(['cable_crunch', 'hanging_leg_raise', 'roman_chair_sit_up', 'plank']);
  });

  it('기구가 없으면 맨몸 복근 운동으로 바뀐다', () => {
    const abs = adaptPresetRoutines([]).find((s) => s.name === '복근');
    expect(abs.exercises.map((e) => e.exerciseId)).toEqual(['crunch', 'lying_leg_raise', 'plank']);
    expect(abs.droppedExerciseIds).toEqual(['roman_chair_sit_up']);
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

describe('세부 타깃 분리 (엉덩이·종아리)', () => {
  it('종아리 운동은 스쿼트의 대체로 나오지 않는다', () => {
    const result = ids(getSubstitutes('barbell_back_squat', { ownedEquipmentIds: ALL_OWNED, busyEquipmentIds: ['rack'] }, 10));
    expect(result.some((id) => EXERCISES_BY_ID[id].target === 'calves')).toBe(false);
  });

  it('힙 쓰러스트 머신이 사용 중이면 같은 힙 쓰러스트 동작을 먼저 추천한다', () => {
    const result = ids(getSubstitutes('hip_thrust_machine', { ownedEquipmentIds: ALL_OWNED, busyEquipmentIds: ['hipthrust'] }));
    expect(result).toEqual(['barbell_hip_thrust', 'glute_bridge', 'kettlebell_swing']);
  });

  it('복근: 크런치 → 같은 크런치 동작 먼저', () => {
    const [first] = getSubstitutes('cable_crunch', { ownedEquipmentIds: ALL_OWNED, busyEquipmentIds: ['cable'] });
    expect(first.exercise.id).toBe('roman_chair_sit_up');
    expect(first.reason).toBe('같은 복근 운동 · 비어 있는 로만 체어 사용 · 비슷한 크런치 동작');
  });
});
