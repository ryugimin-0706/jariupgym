import { useState } from 'react';
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISES_BY_ID, UNIT_LABEL, unitOf } from '../data/exercises.js';
import { TARGETS } from '../data/taxonomy.js';
import { MAX_SETS_IN_WORKOUT, doneSetsOf, setLogOf } from '../workout/workoutReducer.js';
import Button from './Button.jsx';
import { GuideButton } from './ExerciseGuide.jsx';
import Tag from './Tag.jsx';

/** 한 쪽 무게로 적는 기구 */
const PER_SIDE_EQUIPMENT = new Set(['dumbbell', 'kettlebell']);

/**
 * 화면 4 운동 카드: 세트마다 무게·횟수를 적고 체크한다.
 *
 * @param {{
 *   item: import('../workout/workoutReducer.js').WorkoutItem,
 *   owned: boolean,          내 헬스장에 있는 기구인지
 *   busy?: boolean,          기구가 지금 사용 중인지
 *   canMarkBusy: boolean,    "자리 없음" 가능 여부 (맨몸·직접 입력은 false)
 *   highlight?: boolean,
 *   hasRecord: boolean,      지난 기록이 있어 불러올 수 있는지
 *   onToggleSet: (index: number) => void,
 *   onUpdateSet: (index: number, patch: { weight?: number | null, reps?: number | null }) => void,
 *   onUndoSet: () => void,   완료 카드 탭: 마지막 체크 취소
 *   onAddSet: () => void,
 *   onRemoveSet: () => void,
 *   onLoad: () => void,      지난 기록 불러오기
 *   onRestore: () => void,   건너뛴 운동 되돌리기
 *   onBusy: () => void,
 *   onDefer: () => void,
 *   onSkip: () => void,
 *   onAddEquipment: () => void, 내 헬스장에 없는 기구를 바로 등록
 *   onGuide: (exerciseId: string) => void, 운동 방법 보기
 *   onRemoveExercise: () => void, 운동 중에 추가한 운동 빼기
 * }} props
 */
export default function ExerciseCard({
  item,
  owned,
  busy,
  canMarkBusy,
  highlight,
  hasRecord,
  onToggleSet,
  onUpdateSet,
  onUndoSet,
  onAddSet,
  onRemoveSet,
  onLoad,
  onRestore,
  onBusy,
  onDefer,
  onSkip,
  onAddEquipment,
  onGuide,
  onRemoveExercise,
}) {
  const [laterOpen, setLaterOpen] = useState(false);
  const exercise = item.exerciseId ? EXERCISES_BY_ID[item.exerciseId] : null;
  const name = exercise?.name ?? item.customName;
  const equipment = exercise ? EQUIPMENT_BY_ID[exercise.equipmentId] : null;
  const original = item.originalExerciseId ? EXERCISES_BY_ID[item.originalExerciseId] : null;
  const log = setLogOf(item);
  const doneSets = doneSetsOf(item);
  const unit = UNIT_LABEL[unitOf(item.exerciseId)];
  const bodyweight = equipment?.alwaysAvailable;

  // 끝난 카드: 흐리게. 완료 카드를 탭하면 마지막 체크 취소, 건너뛴 카드를 탭하면 되돌리기
  if (item.status !== 'pending') {
    const done = item.status === 'done';
    return (
      <button
        type="button"
        onClick={done ? onUndoSet : onRestore}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left opacity-60 transition active:opacity-80"
      >
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            done ? 'bg-mint-500 text-white' : 'bg-slate-200 text-slate-500'
          }`}
          aria-hidden
        >
          {done ? '✓' : '–'}
        </span>
        <span className={`flex-1 font-medium ${done ? 'line-through decoration-slate-400' : ''}`}>{name}</span>
        {!done && <Tag>건너뜀{doneSets > 0 && ` · ${doneSets}/${log.length}세트`}</Tag>}
        <span className="text-xs text-slate-400">{done ? `${log.length}세트 · 탭하면 취소` : '탭하면 되돌리기'}</span>
      </button>
    );
  }

  const lastRowDone = log.at(-1)?.done;

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-colors ${
        highlight ? 'animate-swap border-mint-500' : 'border-slate-100'
      }`}
    >
      {original && (
        <p className="mb-1 text-xs font-medium text-mint-700">
          <span className="text-slate-400 line-through">{original.name}</span> → {name}
        </p>
      )}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <h3 className="text-lg leading-snug font-bold">{name}</h3>
            <GuideButton exerciseId={item.exerciseId} onOpen={onGuide} />
          </div>
          <p className="truncate text-sm text-slate-500">
            {exercise ? (
              <>
                {equipment.emoji} {equipment.name} · {TARGETS[exercise.target].label}
              </>
            ) : (
              '직접 입력한 운동'
            )}
          </p>
        </div>
        {canMarkBusy ? (
          <Button variant="coral" className="shrink-0" onClick={onBusy}>
            {owned ? '자리 없음' : '대체 운동'}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="shrink-0"
            aria-expanded={laterOpen}
            onClick={() => setLaterOpen((v) => !v)}
          >
            나중에 {laterOpen ? '▴' : '▾'}
          </Button>
        )}
      </div>

      {laterOpen && !canMarkBusy && (
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setLaterOpen(false);
              onDefer();
            }}
          >
            순서 뒤로 미루기
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              setLaterOpen(false);
              onSkip();
            }}
          >
            이번엔 건너뛰기
          </Button>
        </div>
      )}

      {(!exercise || !owned || busy || item.added) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.added && (
            <>
              <Tag tone="mint">오늘 추가{item.routineExerciseId ? ' · 내 루틴에도 넣음' : ''}</Tag>
              <button
                type="button"
                onClick={onRemoveExercise}
                className="-my-2 min-h-11 rounded-full px-2 text-xs font-semibold text-slate-500 active:underline"
              >
                빼기
              </button>
            </>
          )}
          {!exercise && <Tag>대체 추천 미지원</Tag>}
          {exercise && !owned && (
            <>
              <Tag tone="coral">내 헬스장에 없는 기구</Tag>
              <button
                type="button"
                onClick={onAddEquipment}
                className="-my-2 min-h-11 rounded-full px-2 text-xs font-semibold text-mint-700 underline-offset-2 active:underline"
              >
                ＋ 기구 추가
              </button>
            </>
          )}
          {busy && <Tag tone="coral">기구 사용 중</Tag>}
        </div>
      )}

      {/* 세트 줄: 번호 / 무게 / 횟수 / 체크 */}
      <div className="mt-3 grid grid-cols-[2.25rem_1fr_1fr_2.75rem] items-center gap-x-2 gap-y-1.5">
        <span className="text-center text-[11px] text-slate-400">세트</span>
        <span className="text-center text-[11px] text-slate-400">
          {equipment && PER_SIDE_EQUIPMENT.has(equipment.id) ? '한 쪽 무게' : '무게'}
        </span>
        <span className="text-center text-[11px] text-slate-400">{unit === '초' ? '시간' : '횟수'}</span>
        <span className="text-center text-[11px] text-slate-400">
          {doneSets}/{log.length}
        </span>

        {log.map((row, i) => (
          <SetRowView
            key={i}
            index={i}
            row={row}
            unit={unit}
            weightPlaceholder={bodyweight ? '맨몸' : '-'}
            onToggle={() => onToggleSet(i)}
            onUpdate={(patch) => onUpdateSet(i, patch)}
          />
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <div className="flex items-center rounded-2xl bg-slate-50">
          <StepButton label="세트 빼기" disabled={log.length <= 1 || lastRowDone} onClick={onRemoveSet}>
            −
          </StepButton>
          <span className="px-1 text-sm font-semibold text-navy-700">세트</span>
          <StepButton label="세트 추가" disabled={log.length >= MAX_SETS_IN_WORKOUT} onClick={onAddSet}>
            +
          </StepButton>
        </div>
        <Button variant="outline" className="flex-1" disabled={!hasRecord} onClick={onLoad}>
          {hasRecord ? '지난 기록 불러오기' : '지난 기록 없음'}
        </Button>
      </div>
    </article>
  );
}

function SetRowView({ index, row, unit, weightPlaceholder, onToggle, onUpdate }) {
  return (
    <>
      <span
        className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold ${
          row.done ? 'bg-mint-50 text-mint-700' : 'bg-slate-50 text-slate-500'
        }`}
      >
        {index + 1}
      </span>
      <NumberField
        value={row.weight}
        suffix="kg"
        placeholder={weightPlaceholder}
        decimal
        max={999}
        done={row.done}
        label={`${index + 1}세트 무게`}
        onCommit={(weight) => onUpdate({ weight })}
      />
      <NumberField
        value={row.reps}
        suffix={unit}
        placeholder="-"
        max={unit === '초' ? 3600 : 999}
        done={row.done}
        label={`${index + 1}세트 ${unit === '초' ? '시간' : '횟수'}`}
        onCommit={(reps) => onUpdate({ reps })}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={row.done}
        aria-label={row.done ? `${index + 1}세트 완료 취소` : `${index + 1}세트 완료`}
        className={`flex size-11 items-center justify-center rounded-full text-lg font-bold transition active:scale-95 ${
          row.done ? 'bg-mint-500 text-white' : 'bg-slate-100 text-slate-400 active:bg-slate-200'
        }`}
      >
        ✓
      </button>
    </>
  );
}

/**
 * 숫자 입력칸. 입력하는 대로 바로 반영한다(✓를 바로 눌러도 값이 남도록 — 아이폰은 버튼을 눌러도
 * 입력칸 포커스가 빠지지 않을 수 있다). 입력 중 글자는 그대로 보여주고, 칸을 벗어나면 정리한다.
 * 비우면 null (무게 없음).
 */
function NumberField({ value, suffix, placeholder, decimal = false, max, done, label, onCommit }) {
  const [draft, setDraft] = useState(null); // 입력 중일 때만 문자열
  const shown = draft ?? (value ?? '').toString();

  /** 문자열 → 숫자 (비우면 null, 잘못된 값은 undefined) */
  const parse = (text) => {
    const trimmed = text.trim().replace(',', '.');
    if (trimmed === '') return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) return undefined;
    return Math.min(decimal ? Math.round(n * 100) / 100 : Math.round(n), max);
  };

  const onChange = (text) => {
    setDraft(text);
    const next = parse(text);
    if (next !== undefined && next !== value) onCommit(next);
  };

  return (
    <label
      className={`flex h-11 items-center gap-1 rounded-xl pr-3 pl-2 focus-within:ring-2 focus-within:ring-mint-500 ${
        done ? 'bg-mint-50' : 'bg-slate-50'
      }`}
    >
      <span className="sr-only">{label}</span>
      <input
        type="text"
        inputMode={decimal ? 'decimal' : 'numeric'}
        enterKeyHint="done"
        value={shown}
        placeholder={placeholder}
        onFocus={(e) => {
          setDraft(shown);
          e.target.select();
        }}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="w-full min-w-0 flex-1 bg-transparent text-right text-lg font-semibold text-navy-900 outline-none placeholder:text-sm placeholder:font-normal placeholder:text-slate-400"
      />
      {(shown !== '' || placeholder === '-') && <span className="shrink-0 pt-0.5 text-xs text-slate-500">{suffix}</span>}
    </label>
  );
}

function StepButton({ label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-2xl text-xl text-navy-700 active:bg-slate-100 disabled:opacity-25"
      {...props}
    >
      {children}
    </button>
  );
}
