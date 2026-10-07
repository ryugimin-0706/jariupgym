/**
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} name
 * @property {string} equipmentId  EQUIPMENT id
 * @property {string} target       TARGETS id
 * @property {string} pattern      PATTERNS id
 * @property {'sec'} [unit]        횟수 대신 시간(초)으로 기록하는 운동 (플랭크)
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
  { id: 'incline_barbell_bench_press', name: '인클라인 바벨 벤치프레스', equipmentId: 'inclinebench', target: 'chest', pattern: 'horizontal_push' },
  { id: 'smith_incline_press', name: '스미스 인클라인 프레스', equipmentId: 'smith', target: 'chest', pattern: 'horizontal_push' },
  { id: 'chest_dips', name: '체스트 딥스', equipmentId: 'pullupbar', target: 'chest', pattern: 'horizontal_push' },
  { id: 'cable_incline_fly', name: '케이블 인클라인 플라이', equipmentId: 'cable', target: 'chest', pattern: 'fly' },
  { id: 'dumbbell_pullover', name: '덤벨 풀오버', equipmentId: 'dumbbell', target: 'chest', pattern: 'pullover' },

  // 등
  { id: 'lat_pulldown', name: '랫풀다운', equipmentId: 'latpull', target: 'back', pattern: 'vertical_pull' },
  { id: 'pull_up', name: '풀업', equipmentId: 'pullupbar', target: 'back', pattern: 'vertical_pull' },
  { id: 'cable_straight_arm_pulldown', name: '케이블 스트레이트암 풀다운', equipmentId: 'cable', target: 'back', pattern: 'vertical_pull' },
  { id: 'seated_cable_row', name: '시티드 케이블 로우', equipmentId: 'seatedrow', target: 'back', pattern: 'horizontal_pull' },
  { id: 'barbell_row', name: '바벨 로우', equipmentId: 'barbell', target: 'back', pattern: 'horizontal_pull' },
  { id: 'one_arm_dumbbell_row', name: '원암 덤벨 로우', equipmentId: 'dumbbell', target: 'back', pattern: 'horizontal_pull' },
  { id: 'chin_up', name: '친업', equipmentId: 'pullupbar', target: 'back', pattern: 'vertical_pull' },
  { id: 'assisted_pull_up', name: '어시스트 풀업', equipmentId: 'assist', target: 'back', pattern: 'vertical_pull' },
  { id: 't_bar_row', name: 'T바 로우', equipmentId: 'tbar', target: 'back', pattern: 'horizontal_pull' },
  { id: 'wide_seated_row', name: '와이드 시티드 로우', equipmentId: 'seatedrow', target: 'back', pattern: 'horizontal_pull' },
  { id: 'barbell_deadlift', name: '바벨 데드리프트', equipmentId: 'barbell', target: 'back', pattern: 'hinge' },
  { id: 'back_extension', name: '백 익스텐션', equipmentId: 'romanchair', target: 'back', pattern: 'hinge' },

  // 하체 - 허벅지 앞
  { id: 'barbell_back_squat', name: '바벨 백스쿼트', equipmentId: 'rack', target: 'quads', pattern: 'squat' },
  { id: 'smith_squat', name: '스미스 스쿼트', equipmentId: 'smith', target: 'quads', pattern: 'squat' },
  { id: 'leg_press', name: '레그프레스', equipmentId: 'legpress', target: 'quads', pattern: 'squat' },
  { id: 'goblet_squat', name: '고블릿 스쿼트', equipmentId: 'dumbbell', target: 'quads', pattern: 'squat' },
  { id: 'bulgarian_split_squat', name: '불가리안 스플릿 스쿼트', equipmentId: 'dumbbell', target: 'quads', pattern: 'lunge' },
  { id: 'bodyweight_lunge', name: '맨몸 런지', equipmentId: 'bodyweight', target: 'quads', pattern: 'lunge' },
  { id: 'leg_extension', name: '레그 익스텐션', equipmentId: 'legext', target: 'quads', pattern: 'isolation' },
  { id: 'hack_squat', name: '핵스쿼트', equipmentId: 'hacksquat', target: 'quads', pattern: 'squat' },
  { id: 'belt_squat', name: '벨트 스쿼트', equipmentId: 'beltsquat', target: 'quads', pattern: 'squat' },
  { id: 'kettlebell_goblet_squat', name: '케틀벨 고블릿 스쿼트', equipmentId: 'kettlebell', target: 'quads', pattern: 'squat' },
  { id: 'barbell_lunge', name: '바벨 런지', equipmentId: 'barbell', target: 'quads', pattern: 'lunge' },
  { id: 'smith_lunge', name: '스미스 런지', equipmentId: 'smith', target: 'quads', pattern: 'lunge' },

  // 하체 - 허벅지 뒤
  { id: 'barbell_romanian_deadlift', name: '바벨 루마니안 데드리프트', equipmentId: 'barbell', target: 'hamstrings', pattern: 'hinge' },
  { id: 'dumbbell_romanian_deadlift', name: '덤벨 루마니안 데드리프트', equipmentId: 'dumbbell', target: 'hamstrings', pattern: 'hinge' },
  { id: 'leg_curl', name: '레그 컬', equipmentId: 'legcurl', target: 'hamstrings', pattern: 'isolation' },
  { id: 'barbell_good_morning', name: '바벨 굿모닝', equipmentId: 'barbell', target: 'hamstrings', pattern: 'hinge' },

  // 하체 - 엉덩이
  { id: 'hip_thrust_machine', name: '힙 쓰러스트 머신', equipmentId: 'hipthrust', target: 'glutes', pattern: 'hip_thrust' },
  { id: 'barbell_hip_thrust', name: '바벨 힙 쓰러스트', equipmentId: 'barbell', target: 'glutes', pattern: 'hip_thrust' },
  { id: 'glute_bridge', name: '글루트 브릿지', equipmentId: 'bodyweight', target: 'glutes', pattern: 'hip_thrust' },
  { id: 'kettlebell_swing', name: '케틀벨 스윙', equipmentId: 'kettlebell', target: 'glutes', pattern: 'hinge' },
  { id: 'hip_abduction', name: '힙 어브덕션', equipmentId: 'abductor', target: 'glutes', pattern: 'isolation' },
  { id: 'cable_kickback', name: '케이블 킥백', equipmentId: 'cable', target: 'glutes', pattern: 'isolation' },

  // 하체 - 허벅지 안쪽
  { id: 'hip_adduction', name: '힙 어덕션', equipmentId: 'abductor', target: 'adductors', pattern: 'isolation' },
  { id: 'cable_hip_adduction', name: '케이블 힙 어덕션', equipmentId: 'cable', target: 'adductors', pattern: 'isolation' },

  // 하체 - 종아리
  { id: 'standing_calf_raise', name: '스탠딩 카프 레이즈', equipmentId: 'calfraise', target: 'calves', pattern: 'isolation' },
  { id: 'leg_press_calf_raise', name: '레그프레스 카프 레이즈', equipmentId: 'legpress', target: 'calves', pattern: 'isolation' },
  { id: 'smith_calf_raise', name: '스미스 카프 레이즈', equipmentId: 'smith', target: 'calves', pattern: 'isolation' },
  { id: 'dumbbell_calf_raise', name: '덤벨 카프 레이즈', equipmentId: 'dumbbell', target: 'calves', pattern: 'isolation' },
  { id: 'bodyweight_calf_raise', name: '맨몸 카프 레이즈', equipmentId: 'bodyweight', target: 'calves', pattern: 'isolation' },

  // 어깨
  { id: 'barbell_overhead_press', name: '바벨 오버헤드프레스', equipmentId: 'rack', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'smith_shoulder_press', name: '스미스 숄더프레스', equipmentId: 'smith', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'dumbbell_shoulder_press', name: '덤벨 숄더프레스', equipmentId: 'dumbbell', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'machine_shoulder_press', name: '숄더프레스 머신', equipmentId: 'shoulderpress', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'dumbbell_lateral_raise', name: '덤벨 사이드 레터럴 레이즈', equipmentId: 'dumbbell', target: 'shoulders', pattern: 'isolation' },
  { id: 'cable_lateral_raise', name: '케이블 레터럴 레이즈', equipmentId: 'cable', target: 'shoulders', pattern: 'isolation' },
  { id: 'arnold_press', name: '아놀드 프레스', equipmentId: 'dumbbell', target: 'shoulders', pattern: 'vertical_push' },
  { id: 'rear_delt_fly_machine', name: '리어 델트 플라이', equipmentId: 'pecdeck', target: 'shoulders', pattern: 'isolation' },
  { id: 'dumbbell_rear_delt_raise', name: '덤벨 리어 델트 레이즈', equipmentId: 'dumbbell', target: 'shoulders', pattern: 'isolation' },
  { id: 'cable_face_pull', name: '케이블 페이스풀', equipmentId: 'cable', target: 'shoulders', pattern: 'isolation' },
  { id: 'barbell_upright_row', name: '바벨 업라이트 로우', equipmentId: 'barbell', target: 'shoulders', pattern: 'isolation' },

  // 팔 앞쪽
  { id: 'barbell_curl', name: '바벨 컬', equipmentId: 'barbell', target: 'biceps', pattern: 'isolation' },
  { id: 'dumbbell_curl', name: '덤벨 컬', equipmentId: 'dumbbell', target: 'biceps', pattern: 'isolation' },
  { id: 'cable_curl', name: '케이블 컬', equipmentId: 'cable', target: 'biceps', pattern: 'isolation' },
  { id: 'hammer_curl', name: '해머 컬', equipmentId: 'dumbbell', target: 'biceps', pattern: 'isolation' },
  { id: 'incline_dumbbell_curl', name: '인클라인 덤벨 컬', equipmentId: 'dumbbell', target: 'biceps', pattern: 'isolation' },
  { id: 'preacher_curl', name: '프리처 컬', equipmentId: 'preacher', target: 'biceps', pattern: 'isolation' },

  // 팔 뒤쪽
  { id: 'cable_pushdown', name: '케이블 푸시다운', equipmentId: 'cable', target: 'triceps', pattern: 'isolation' },
  { id: 'dumbbell_overhead_extension', name: '덤벨 오버헤드 익스텐션', equipmentId: 'dumbbell', target: 'triceps', pattern: 'isolation' },
  { id: 'dips', name: '딥스', equipmentId: 'pullupbar', target: 'triceps', pattern: 'isolation' },
  { id: 'bench_dips', name: '벤치 딥스', equipmentId: 'bodyweight', target: 'triceps', pattern: 'isolation' },
  { id: 'close_grip_bench_press', name: '클로즈그립 벤치프레스', equipmentId: 'bench', target: 'triceps', pattern: 'isolation' },
  { id: 'lying_triceps_extension', name: '바벨 라잉 트라이셉스 익스텐션', equipmentId: 'barbell', target: 'triceps', pattern: 'isolation' },
  { id: 'cable_overhead_extension', name: '케이블 오버헤드 익스텐션', equipmentId: 'cable', target: 'triceps', pattern: 'isolation' },
  { id: 'assisted_dips', name: '어시스트 딥스', equipmentId: 'assist', target: 'triceps', pattern: 'isolation' },

  // 복근
  { id: 'crunch', name: '크런치', equipmentId: 'bodyweight', target: 'abs', pattern: 'crunch' },
  { id: 'cable_crunch', name: '케이블 크런치', equipmentId: 'cable', target: 'abs', pattern: 'crunch' },
  { id: 'roman_chair_sit_up', name: '로만 체어 싯업', equipmentId: 'romanchair', target: 'abs', pattern: 'crunch' },
  { id: 'hanging_leg_raise', name: '행잉 레그 레이즈', equipmentId: 'pullupbar', target: 'abs', pattern: 'leg_raise' },
  { id: 'lying_leg_raise', name: '라잉 레그 레이즈', equipmentId: 'bodyweight', target: 'abs', pattern: 'leg_raise' },
  { id: 'plank', name: '플랭크', equipmentId: 'bodyweight', target: 'abs', pattern: 'brace', unit: 'sec' },
  { id: 'barbell_rollout', name: '바벨 롤아웃', equipmentId: 'barbell', target: 'abs', pattern: 'brace' },
];

/** @type {Record<string, Exercise>} */
export const EXERCISES_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** 데이터 순서(동점 처리용) */
export const EXERCISE_INDEX = Object.fromEntries(EXERCISES.map((e, i) => [e.id, i]));

/** 세트 기록 단위: 대부분 횟수, 플랭크는 초. 직접 입력한 운동은 횟수. */
export const unitOf = (exerciseId) => (exerciseId && EXERCISES_BY_ID[exerciseId]?.unit) || 'reps';
export const UNIT_LABEL = { reps: '회', sec: '초' };
/** 새 세트의 기본 횟수/시간 */
export const DEFAULT_COUNT = { reps: 10, sec: 30 };
