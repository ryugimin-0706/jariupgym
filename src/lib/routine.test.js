import { describe, expect, it } from 'vitest';
import { guessBodyPart, moveItem, splitNameFromChip, summarizeSplit, validateRoutineDraft } from './routine.js';

describe('summarizeSplit', () => {
  it('운동 개수와 주요 부위(많은 순)를 돌려준다', () => {
    const split = {
      id: 's',
      name: '가슴 하는날',
      exercises: [
        { id: '1', exerciseId: 'cable_pushdown', sets: 3 },
        { id: '2', exerciseId: 'barbell_bench_press', sets: 3 },
        { id: '3', exerciseId: 'incline_dumbbell_press', sets: 3 },
        { id: '4', exerciseId: null, customName: '랜드마인 프레스', sets: 3 },
      ],
    };
    expect(summarizeSplit(split)).toEqual({ count: 4, bodyParts: ['가슴', '팔'] });
  });

  it('개수가 같으면 가슴·등·하체·어깨·팔 순서', () => {
    const split = {
      id: 's',
      name: '상체',
      exercises: [
        { id: '1', exerciseId: 'dumbbell_shoulder_press', sets: 3 },
        { id: '2', exerciseId: 'lat_pulldown', sets: 3 },
      ],
    };
    expect(summarizeSplit(split).bodyParts).toEqual(['등', '어깨']);
  });
});

describe('루틴 편집 도우미', () => {
  it('moveItem: 한 칸 이동, 끝에서는 그대로', () => {
    expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b']);
    const list = ['a', 'b'];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 1)).toBe(list);
  });

  it('guessBodyPart: 분할 이름으로 첫 탭 추측', () => {
    expect(guessBodyPart('등 하는날')).toBe('back');
    expect(guessBodyPart('하체 하는날')).toBe('legs');
    expect(guessBodyPart('팔 하는날')).toBe('arms');
    expect(guessBodyPart('상체 하는날')).toBe('chest');
    expect(guessBodyPart('')).toBe('chest');
  });

  it('splitNameFromChip', () => {
    expect(splitNameFromChip('가슴')).toBe('가슴 하는날');
  });

  it('validateRoutineDraft', () => {
    const ex = [{ id: 'e', exerciseId: 'push_up', sets: 3 }];
    expect(validateRoutineDraft([])).toEqual({ ok: false, reason: '분할을 1개 이상 만들어 주세요' });
    expect(validateRoutineDraft([{ id: 's', name: '  ', exercises: ex }]).ok).toBe(false);
    expect(validateRoutineDraft([{ id: 's', name: '등 하는날', exercises: [] }])).toEqual({
      ok: false,
      reason: '운동을 담아 주세요: 등 하는날',
    });
    expect(validateRoutineDraft([{ id: 's', name: '가슴 하는날', exercises: ex }])).toEqual({ ok: true, reason: null });
  });
});
