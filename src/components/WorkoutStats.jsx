/**
 * 대표 화면 운동 현황: 이번 주 도장 카드 + 누르면 이번 달 달력 시트.
 * 기록은 완료 화면에서 저장한다(src/pages/Complete.jsx).
 */
import { useState } from 'react';
import { monthSummary, stampLabel, weekSummary } from '../lib/history.js';
import BottomSheet from './BottomSheet.jsx';

const LEVEL_CLASS = ['bg-slate-100 text-slate-400', 'bg-mint-100 text-mint-800', 'bg-mint-500 text-white', 'bg-mint-700 text-white'];
const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

/** @param {{ history: import('../lib/history.js').WorkoutRecord[] }} props */
export default function WorkoutStats({ history }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const week = weekSummary(history, today);

  const diff = week.count - week.lastWeekCount;
  const badge =
    history.length === 0 || week.count === 0
      ? null
      : diff > 0
        ? `지난주보다 +${diff}`
        : diff === 0
          ? '지난주만큼 했어요'
          : null;

  const footer =
    week.swaps > 0
      ? { emoji: '🔁', text: `자리 없어도 기다리지 않고 ${week.swaps}번 바꿨어요`, accent: true }
      : history.length === 0
        ? { emoji: '💪', text: '첫 운동을 마치면 여기에 도장이 찍혀요' }
        : week.count === 0
          ? { emoji: '🗓️', text: '이번 주 첫 도장을 찍어볼까요?' }
          : { emoji: '👏', text: `이번 주 ${week.count}번, 꾸준히 하고 있어요` };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] active:bg-slate-50"
        aria-label={`이번 주 운동 ${week.count}회. 눌러서 이번 달 기록 보기`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500">📅 이번 주 운동</p>
          <span className="text-xs font-semibold text-mint-700">이번 달 ›</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-2xl font-bold text-navy-700">{week.count}회</p>
          {badge && <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-semibold text-mint-700">{badge}</span>}
        </div>

        <ol className="mt-3 grid grid-cols-7 gap-1.5 text-center" aria-hidden>
          {week.days.map((d) => {
            const done = d.records.length > 0;
            return (
              <li key={d.key}>
                <span
                  className={`relative mx-auto flex aspect-square w-full max-w-10 items-center justify-center rounded-full text-[11px] font-bold ${
                    done
                      ? 'bg-mint-700 text-white'
                      : d.isToday
                        ? 'border-2 border-mint-500'
                        : 'border border-dashed border-slate-200'
                  }`}
                >
                  {done && stampLabel(d.records[0].splitName)}
                  {d.records.length > 1 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-coral-500 text-[10px] text-white">
                      {d.records.length}
                    </span>
                  )}
                </span>
                <span className={`mt-1 block text-[11px] ${d.isToday ? 'font-bold text-mint-700' : 'text-slate-400'}`}>
                  {d.isToday ? '오늘' : d.label}
                </span>
              </li>
            );
          })}
        </ol>

        <p
          className={`mt-3 border-t border-slate-100 pt-3 text-[13px] ${footer.accent ? 'font-semibold text-mint-700' : 'text-slate-500'}`}
        >
          <span aria-hidden>{footer.emoji}</span> {footer.text}
        </p>
      </button>

      <MonthSheet open={open} onClose={() => setOpen(false)} history={history} today={today} />
    </>
  );
}

function MonthSheet({ open, onClose, history, today }) {
  const [offset, setOffset] = useState(0); // 0 = 이번 달, -1 = 지난달 …
  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const m = monthSummary(history, year, month);
  const records = m.days.flatMap((d) => d.records.map((r) => ({ ...r, day: d.day }))).reverse();

  const close = () => {
    setOffset(0);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={close} title="운동 기록">
      <div className="-mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          className="flex size-11 items-center justify-center rounded-full text-xl text-navy-700 active:bg-slate-100"
          aria-label="지난달"
        >
          ‹
        </button>
        <p className="font-bold text-navy-700">
          {year}년 {month + 1}월
        </p>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          disabled={offset >= 0}
          className="flex size-11 items-center justify-center rounded-full text-xl text-navy-700 active:bg-slate-100 disabled:opacity-25"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
        <Stat label="운동" value={`${m.count}회`} />
        <Stat label="총 세트" value={`${m.sets}세트`} />
        <Stat label="바꾼 횟수" value={`${m.swaps}번`} accent />
      </dl>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] text-slate-400" aria-hidden>
        {['월', '화', '수', '목', '금', '토', '일'].map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <ol className="mt-1 grid grid-cols-7 gap-1.5">
        {Array.from({ length: m.leadingBlanks }, (_, i) => (
          <li key={`b${i}`} aria-hidden />
        ))}
        {m.days.map((d) => {
          const isToday = offset === 0 && d.day === today.getDate();
          return (
            <li
              key={d.key}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold ${LEVEL_CLASS[d.level]} ${
                isToday ? 'ring-2 ring-navy-700' : ''
              }`}
              aria-label={`${d.day}일${d.records.length ? `, ${d.records.map((r) => r.splitName).join(', ')}` : ''}`}
            >
              {d.day}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 flex items-center justify-end gap-1 text-[11px] text-slate-400">
        적게
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={`size-3 rounded ${c}`} aria-hidden />
        ))}
        많이 (세트 수)
      </p>

      <h3 className="mt-5 text-sm font-semibold text-navy-700">이 달의 운동</h3>
      {records.length === 0 ? (
        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">이 달에는 마친 운동이 없어요</p>
      ) : (
        <ul className="mt-1 divide-y divide-slate-50">
          {records.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2.5">
              <span className="w-14 shrink-0 text-xs text-slate-400">
                {month + 1}/{r.day} ({WEEKDAY_SHORT[new Date(year, month, r.day).getDay()]})
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-navy-900">{r.splitName}</span>
              <span className="shrink-0 text-xs text-slate-500">
                {r.doneSets}세트{r.swapCount > 0 && <span className="text-mint-700"> · 🔁{r.swapCount}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={`rounded-xl py-2.5 ${accent ? 'bg-mint-50' : 'bg-slate-50'}`}>
      <dt className={`text-[11px] ${accent ? 'text-mint-700' : 'text-slate-500'}`}>{label}</dt>
      <dd className={`mt-0.5 font-bold ${accent ? 'text-mint-800' : 'text-navy-700'}`}>{value}</dd>
    </div>
  );
}
