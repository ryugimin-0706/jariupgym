/**
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} name
 * @property {string} equipmentId  EQUIPMENT id
 * @property {string} target       TARGETS id
 * @property {string} pattern      PATTERNS id
 */

// 배열 순서 = 점수·프리웨이트 여부까지 같을 때의 우선순위 (PRD 5-2 순서 유지)
/** @type {Exercise[]} */
export const EXERCISES = [
  // 가슴
  { id: 'barbell_bench_press', name: '바벨 벤치프레스', equipmentId: 'bench', target: 'chest', pattern: 'horizontal_push' },
  { id: 'smith_bench_press', name: '스미스 벤치프레스', equipmentId: 'smith', target: 'chest', pattern: 'horizontal_push' },
  { id: 'dumbbell_bench_press', name: '덤벨 벤치프레스', equipmentId: 'dumbbell', target: 'chest', pattern: 'horizontal_push' },
  { id: 'chest_press', name: '체스트프레스', equipmentId: 'chestpress', target: 'chest', pattern: 'horizontal_push' },
  { id: 'incline_dumbbell_press', name: '인클라인 덤벨프레스', equipmentId: 'dumbbell', target: 'chest', pattern: 'horizontal_push' },
  { id: 'push_up', name: '푸시업', equipmentId: 'bodyweight', target: 'chest', pattern: 'horizontal_push' },
  { id: 'pec_deck_fly', name: '펙덱 플라이', equipmentId: 'pecdeck', target: 'chest', pattern: 'fly' },
  { id: 'cable_crossover', name: '케이블 크로스오버', equipmentId: 'cable', target: 'chest', pattern: 'fly' },
  { id: 'dumbbell_fly', name: '덤벨 플라이', equipmentId: 'dumbbell', target: 'chest', pattern: 'fly' },

  // 등
  { id: 'lat_pulldown', name: '랫풀다운', equipmentId: 'latpull', target: 'back', pattern: 'vertical_pull' },
  { id: 'pull_up', name: '풀업', equipmentId: 'pullupbar', target: 'back', pattern: 'vertical_pull' },
  { id: 'cable_straight_arm_pulldown', name: '케이블 스트레이트암 풀다운', equipmentId: 'cable', target: 'back', pattern: 'vertical_pull' },
  { id: 'seated_cable_row', name: '시티드 케이블 로우', equipmentId: 'seatedrow', target: 'back', pattern: 'horizontal_pull' },
  { id: 'barbell_row', name: '바벨 로우', equipmentId: 'barbell', target: 'back', pattern: 'horizontal_pull' },
  { id: 'one_arm_dumbbell_row', name: '원암 덤벨 로우', equipmentId: 'dumbbell', target: 'back', pattern: 'horizontal_pull' },

  // 하체 - 허벅지 앞
  { id: 'barbell_back_squat', name: '바벨 백스쿼트', equipmentId: 'rack', target: 'quads', pattern: 'squat' },
  { id: 'smith_squat', name: '스미스 스쿼트', equipmentId: 'smith', target: 'quads', pattern: 'squat' },
  { id: 'leg_press', name: '레그프레스', equipmentId: 'legpress', target: 'quads', pattern: 'squat' },
  { id: 'goblet_squat', name: '고블릿 스쿼트', equipmentId: 'dumbbell', target: 'quads', pattern: 'squat' },
  { id: 'bulgarian_split_squat', name: '불가리안 스플릿 스쿼트', equipmentId: 'dumbbell', target: 'quads', pattern: 'lunge' },
  { id: 'bodyweight_lunge', name: '맨몸 런지', equipmentId: 'bodyweight', target: 'quads', pattern: 'lunge' },
  { id: 'leg_extension', name: '레그 익스텐션', equipmentId: 'legext', target: 'quads', pattern: 'isolation' },

  // 하체 - 허벅지 뒤·엉덩이
  { id: 'barbell_romanian_deadlift', name: '바벨 루마니안 데드리프트', equipmentId: 'barbell', target: 'hamstrings', pattern: 'hinge' },
  { id: 'dumbbell_romanian_deadlift', name: '덤벨 루마니안 데드리프트', equipmentId: 'dumbbell', target: 'hamstrings', pattern: 'hinge' },
  { id: 'leg_curl', name: '레그 컬', equipmentId: 'legcurl', target: 'hamstrings', pattern: 'isolation' },

  // 어깨
  { id: 'barbell_overhead_press', name: '바벨 오버헤드프레스', equipmentId: 'rack', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'smith_shoulder_press', name: '스미스 숄더프레스', equipmentId: 'smith', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'dumbbell_shoulder_press', name: '덤벨 숄더프레스', equipmentId: 'dumbbell', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'machine_shoulder_press', name: '숄더프레스 머신', equipmentId: 'shoulderpress', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'dumbbell_lateral_raise', name: '덤벨 사이드 레터럴 레이즈', equipmentId: 'dumbbell', target: 'shoulders', pattern: 'isolation' },
  { id: 'cable_lateral_raise', name: '케이블 레터럴 레이즈', equipmentId: 'cable', target: 'shoulders', pattern: 'isolation' },

  // 팔 앞쪽
  { id: 'barbell_curl', name: '바벨 컬', equipmentId: 'barbell', target: 'biceps', pattern: 'isolation' },
  { id: 'dumbbell_curl', name: '덤벨 컬', equipmentId: 'dumbbell', target: 'biceps', pattern: 'isolation' },
  { id: 'cable_curl', name: '케이블 컬', equipmentId: 'cable', target: 'biceps', pattern: 'isolation' },

  // 팔 뒤쪽
  { id: 'cable_pushdown', name: '케이블 푸시다운', equipmentId: 'cable', target: 'triceps', pattern: 'isolation' },
  { id: 'dumbbell_overhead_extension', name: '덤벨 오버헤드 익스텐션', equipmentId: 'dumbbell', target: 'triceps', pattern: 'isolation' },
  { id: 'dips', name: '딥스', equipmentId: 'pullupbar', target: 'triceps', pattern: 'isolation' },
  { id: 'bench_dips', name: '벤치 딥스', equipmentId: 'bodyweight', target: 'triceps', pattern: 'isolation' },
];

/** @type {Record<string, Exercise>} */
export const EXERCISES_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** 데이터 순서(동점 처리용) */
export const EXERCISE_INDEX = Object.fromEntries(EXERCISES.map((e, i) => [e.id, i]));
