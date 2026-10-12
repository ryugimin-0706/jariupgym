import { describe, expect, it } from 'vitest';
import { MAX_RECORDS, addRecord, dateKey, levelOf, monthSummary, stampLabel, weekSummary } from './history.js';

const rec = (id, date, extra = {}) => ({ id, date, splitName: '가슴·삼두', doneSets: 15, volume: 0, swapCount: 0, ...extra });

describe('dateKey', () => {
  it('기기 시간 기준 YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('addRecord', () => {
  it('같은 세션은 한 번만 저장', () => {
    const h = addRecord([], rec('a', '2026-10-12'));
    expect(addRecord(h, rec('a', '2026-10-12'))).toBe(h);
    expect(addRecord(h, rec('b', '2026-10-12'))).toHaveLength(2);
  });
  it('최근 MAX_RECORDS개만 남긴다', () => {
    let h = [];
    for (let i = 0; i < MAX_RECORDS + 5; i++) h = addRecord(h, rec(`r${i}`, '2026-10-12'));
    expect(h).toHaveLength(MAX_RECORDS);
    expect(h[0].id).toBe('r5');
  });
});

describe('stampLabel', () => {
  it('첫 단어 앞 두 글자', () => {
    expect(stampLabel('가슴·삼두')).toBe('가슴');
    expect(stampLabel('가슴 하는날')).toBe('가슴');
    expect(stampLabel('하체')).toBe('하체');
    expect(stampLabel('Upper Body')).toBe('Up');
    expect(stampLabel('  ')).toBe('✓');
  });
});

describe('weekSummary', () => {
  // 2026-10-15는 목요일 → 이번 주 10/12(월) ~ 10/18(일), 지난주 10/5 ~ 10/11
  const today = new Date(2026, 9, 15, 9);
  const history = [
    rec('1', '2026-10-05'),
    rec('2', '2026-10-11'),
    rec('3', '2026-10-12', { swapCount: 2 }),
    rec('4', '2026-10-14', { swapCount: 1 }),
    rec('5', '2026-10-14'),
    rec('6', '2026-10-19'),
  ];
  const w = weekSummary(history, today);

  it('월요일부터 7일, 오늘 표시', () => {
    expect(w.days.map((d) => d.label).join('')).toBe('월화수목금토일');
    expect(w.days[0].key).toBe('2026-10-12');
    expect(w.days[6].key).toBe('2026-10-18');
    expect(w.days.findIndex((d) => d.isToday)).toBe(3);
  });
  it('횟수·지난주·바꾼 횟수', () => {
    expect(w.count).toBe(3);
    expect(w.days[2].records).toHaveLength(2);
    expect(w.lastWeekCount).toBe(2);
    expect(w.swaps).toBe(3);
  });
  it('일요일이면 그 주 월요일부터', () => {
    expect(weekSummary([], new Date(2026, 9, 18)).days[0].key).toBe('2026-10-12');
  });
});

describe('monthSummary', () => {
  it('2026년 10월: 목요일 시작 → 앞 빈칸 3, 31일', () => {
    const m = monthSummary([rec('a', '2026-10-01', { doneSets: 25 }), rec('b', '2026-10-01', { doneSets: 0 }), rec('c', '2026-11-01')], 2026, 9);
    expect(m.leadingBlanks).toBe(3);
    expect(m.days).toHaveLength(31);
    expect(m.count).toBe(2);
    expect(m.activeDays).toBe(1);
    expect(m.days[0].level).toBe(3);
  });
  it('운동했는데 세트가 0이어도 칸은 칠한다', () => {
    const m = monthSummary([rec('a', '2026-10-02', { doneSets: 0 })], 2026, 9);
    expect(m.days[1].level).toBe(1);
  });
  it('levelOf', () => {
    expect([0, 1, 9, 10, 19, 20].map(levelOf)).toEqual([0, 1, 1, 2, 2, 3]);
  });
});
