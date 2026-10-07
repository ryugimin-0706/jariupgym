/** PRD 5-3 추천 루틴 (화면 2-B). 모든 운동 기본 3세트. */
export const DEFAULT_SETS = 3;

export const PRESET_ROUTINES = [
  {
    id: 'preset_chest_triceps',
    name: '가슴·삼두',
    exerciseIds: [
      'barbell_bench_press',
      'incline_dumbbell_press',
      'pec_deck_fly',
      'cable_pushdown',
      'dumbbell_overhead_extension',
    ],
  },
  {
    id: 'preset_back_biceps',
    name: '등·이두',
    exerciseIds: ['lat_pulldown', 'seated_cable_row', 'one_arm_dumbbell_row', 'barbell_curl', 'cable_curl'],
  },
  {
    id: 'preset_legs',
    name: '하체',
    exerciseIds: ['barbell_back_squat', 'leg_press', 'leg_extension', 'barbell_romanian_deadlift', 'leg_curl'],
  },
  {
    id: 'preset_shoulders',
    name: '어깨',
    exerciseIds: [
      'barbell_overhead_press',
      'dumbbell_lateral_raise',
      'cable_lateral_raise',
      'machine_shoulder_press',
    ],
  },
];
