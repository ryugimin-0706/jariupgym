/**
 * localStorage / sessionStorage 래퍼.
 * 사생활 보호 모드, 저장 공간 부족, 손상된 JSON에서도 앱이 멈추지 않도록 모든 접근을 try/catch로 감싼다.
 * 실패하면 null을 돌려주고, 앱은 "저장된 값 없음"으로 정상 동작한다.
 */

export const KEYS = {
  gym: 'jariupgym:gym',
  routine: 'jariupgym:routine',
  workout: 'jariupgym:workout', // sessionStorage
};

export const ROUTINE_VERSION = 1;

function getStore(kind) {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function read(kind, key) {
  try {
    const raw = getStore(kind)?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(kind, key, value) {
  try {
    getStore(kind)?.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(kind, key) {
  try {
    getStore(kind)?.removeItem(key);
  } catch {
    // 무시
  }
}

// ── 내 헬스장 기구 ─────────────────────────────

/** @returns {string[] | null} */
export function loadGym() {
  const data = read('local', KEYS.gym);
  return Array.isArray(data?.equipmentIds) ? data.equipmentIds : null;
}

/** @param {string[]} equipmentIds */
export function saveGym(equipmentIds) {
  return write('local', KEYS.gym, { equipmentIds });
}

// ── 내 루틴 ───────────────────────────────────

/**
 * @typedef {Object} RoutineExercise
 * @property {string} id
 * @property {string | null} exerciseId  null이면 직접 입력
 * @property {string} [customName]
 * @property {number} sets
 *
 * @typedef {Object} Split
 * @property {string} id
 * @property {string} name
 * @property {RoutineExercise[]} exercises
 *
 * @typedef {Object} Routine
 * @property {number} version
 * @property {'custom' | 'recommended'} source
 * @property {Split[]} splits
 */

/** @returns {Routine | null} */
export function loadRoutine() {
  const data = read('local', KEYS.routine);
  if (!data || data.version !== ROUTINE_VERSION || !Array.isArray(data.splits)) return null;
  return data;
}

/** @param {Omit<Routine, 'version'>} routine */
export function saveRoutine(routine) {
  return write('local', KEYS.routine, { ...routine, version: ROUTINE_VERSION });
}

// ── 운동 세션 (sessionStorage, 저장 루틴과 별개) ──

export function loadWorkout() {
  return read('session', KEYS.workout);
}

export function saveWorkout(workout) {
  return write('session', KEYS.workout, workout);
}

export function clearWorkout() {
  remove('session', KEYS.workout);
}

// ── 데이터 초기화 ──────────────────────────────

export function clearAll() {
  remove('local', KEYS.gym);
  remove('local', KEYS.routine);
  clearWorkout();
}
