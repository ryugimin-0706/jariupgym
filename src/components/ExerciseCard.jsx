import { useState } from 'react';
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { TARGETS } from '../data/taxonomy.js';
import Button from './Button.jsx';
import { GuideButton } from './ExerciseGuide.jsx';
import Tag from './Tag.jsx';

/**
 * 화면 4 운동 카드.
 *
 * @param {{
 *   item: import('../workout/workoutReducer.js').WorkoutItem,
 *   owned: boolean,          내 헬스장에 있는 기구인지
 *   busy?: boolean,          기구가 지금 사용 중인지
 *   canMarkBusy: boolean,    "자리 없음" 가능 여부 (맨몸·직접 입력은 false)
 *   highlight?: boolean,
 *   onToggleDone: () => void,
 *   onBusy: () => void,
 *   onDefer: () => void,
 *   onSkip: () => void,
 *   onAddEquipment: () => void, 내 헬스장에 없는 기구를 바로 등록
 *   onGuide: (exerciseId: string) => void, 운동 방법 보기
 * }} props
 */
export default function ExerciseCard({
  item,
  owned,
  busy,
  canMarkBusy,
  highlight,
  onToggleDone,
  onBusy,
  onDefer,
  onSkip,
  onAddEquipment,
  onGuide,
}) {
  const [laterOpen, setLaterOpen] = useState(false);
  const exercise = item.exerciseId ? EXERCISES_BY_ID[item.exerciseId] : null;
  const name = exercise?.name ?? item.customName;
  const equipment = exercise ? EQUIPMENT_BY_ID[exercise.equipmentId] : null;
  const original = item.originalExerciseId ? EXERCISES_BY_ID[item.originalExerciseId] : null;

  // 끝난 카드: 흐리게, 탭하면 취소
  if (item.status !== 'pending') {
    const done = item.status === 'done';
    return (
      <button
        type="button"
        onClick={onToggleDone}
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
        {!done && <Tag>건너뜀</Tag>}
        <span className="text-xs text-slate-400">{done ? '탭하면 취소' : '탭하면 되돌리기'}</span>
      </button>
    );
  }

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-colors ${
        highlight ? 'animate-swap border-mint-500' : 'border-slate-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {original && (
            <p className="mb-1 text-xs font-medium text-mint-700">
              <span className="text-slate-400 line-through">{original.name}</span> → {name}
            </p>
          )}
          <div className="flex items-center">
            <h3 className="text-lg leading-snug font-bold">{name}</h3>
            <GuideButton exerciseId={item.exerciseId} onOpen={onGuide} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {exercise ? (
              <>
                {equipment.emoji} {equipment.name} · {TARGETS[exercise.target].label}
              </>
            ) : (
              '직접 입력한 운동'
            )}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-navy-50 px-3 py-1 text-sm font-semibold text-navy-700">
          {item.sets}세트
        </span>
      </div>

      {(!exercise || !owned || busy) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
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

      <div className="mt-4 flex gap-2">
        <Button variant="mint" className="flex-1" onClick={onToggleDone}>
          ✓ 완료
        </Button>
        {canMarkBusy ? (
          <Button variant="coral" className="flex-1" onClick={onBusy}>
            {owned ? '자리 없음' : '대체 운동 보기'}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1"
            aria-expanded={laterOpen}
            onClick={() => setLaterOpen((v) => !v)}
          >
            나중에 할게요 {laterOpen ? '▴' : '▾'}
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
    </article>
  );
}
