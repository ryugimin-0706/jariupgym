import { describe, expect, it } from 'vitest';
import { summarizeSplit } from './routine.js';

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
