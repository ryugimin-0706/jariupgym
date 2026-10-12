/**
 * 운동 기록(마친 운동 1회 = 기록 1개)과 대표 화면 현황 계산. 화면과 저장에 묶이지 않은 순수 함수만 둔다.
 *
 * @typedef {Object} WorkoutRecord
 * @property {string} id         운동 세션 id (같은 운동을 두 번 저장하지 않게)
 * @property {string} date       마친 날, 기기 시간 기준 'YYYY-MM-DD'
 * @property {string} splitName
 * @property {number} doneSets
 * @property {number} volume     kg (무게 × 횟수 합)
 * @property {number} swapCount  자리 없어서 바꾼 횟수
 */

/** 기록이 끝없이 늘지 않게 최근 것만 남긴다 (주 5회 기준 1년 반 정도) */
export const MAX_RECORDS = 400;

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

/** @param {Date} d @returns {string} 기기 시간 기준 'YYYY-MM-DD' */
export function dateKey(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 그 주 월요일 0시 */
function mondayOf(d) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/**
 * 기록 추가. 같은 id가 이미 있으면 그대로 둔다.
 * @param {WorkoutRecord[]} history @param {WorkoutRecord} record @returns {WorkoutRecord[]}
 */
export function addRecord(history, record) {
  if (history.some((r) => r.id === record.id)) return history;
  return [...history, record].slice(-MAX_RECORDS);
}

/**
 * 도장에 찍을 짧은 이름: "가슴·삼두" → "가슴", "가슴 하는날" → "가슴", "Upper Body" → "Up"
 * @param {string} splitName
 */
export function stampLabel(splitName) {
  const first = splitName.trim().split(/[·\s,/+&]+/).find(Boolean) ?? '';
  return [...first].slice(0, 2).join('') || '✓';
}

/**
 * 이번 주(월~일) 현황
 * @param {WorkoutRecord[]} history @param {Date} today
 */
export function weekSummary(history, today) {
  const monday = mondayOf(today);
  const todayKey = dateKey(today);
  const days = WEEKDAYS.map((label, i) => {
    const key = dateKey(addDays(monday, i));
    return { key, label, isToday: key === todayKey, records: history.filter((r) => r.date === key) };
  });
  const thisWeek = days.flatMap((d) => d.records);
  const lastStart = dateKey(addDays(monday, -7));
  const lastEnd = dateKey(addDays(monday, -1));
  return {
    days,
    count: thisWeek.length,
    lastWeekCount: history.filter((r) => r.date >= lastStart && r.date <= lastEnd).length,
    swaps: thisWeek.reduce((n, r) => n + r.swapCount, 0),
  };
}

/** 세트 수로 칸 진하기: 0 없음 / 1 ~9세트 / 2 ~19세트 / 3 20세트 이상 */
export function levelOf(sets) {
  if (sets <= 0) return 0;
  if (sets < 10) return 1;
  if (sets < 20) return 2;
  return 3;
}

/**
 * 한 달 달력 (월요일 시작)
 * @param {WorkoutRecord[]} history @param {number} year @param {number} month 0~11
 */
export function monthSummary(history, year, month) {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: lastDay }, (_, i) => {
    const key = dateKey(new Date(year, month, i + 1));
    const records = history.filter((r) => r.date === key);
    const sets = records.reduce((n, r) => n + r.doneSets, 0);
    return { day: i + 1, key, records, sets, level: records.length ? Math.max(1, levelOf(sets)) : 0 };
  });
  const inMonth = days.flatMap((d) => d.records);
  return {
    leadingBlanks: (first.getDay() + 6) % 7,
    days,
    count: inMonth.length,
    activeDays: days.filter((d) => d.records.length).length,
    sets: inMonth.reduce((n, r) => n + r.doneSets, 0),
    swaps: inMonth.reduce((n, r) => n + r.swapCount, 0),
  };
}
