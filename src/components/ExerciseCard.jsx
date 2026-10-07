import { useState } from 'react';
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { TARGETS } from '../data/taxonomy.js';
import Button from './Button.jsx';
import { GuideButton } from './ExerciseGuide.jsx';
import Tag from './Tag.jsx';
import { doneSetsOf } from '../workout/workoutReducer.js';

/**
 * 화면 4 운동 카드.
 *
 * @param {{
 *   item: import('../workout/workoutReducer.js').WorkoutItem,
 *   owned: boolean,          내 헬스장에 있는 기구인지
 *   busy?: boolean,          기구가 지금 사용 중인지
 *   canMarkBusy: boolean,    "자리 없음" 가능 여부 (맨몸·직접 입력은 false)
 *   highlight?: boolean,
 *   onCompleteSet: () => void, 한 세트 완료 (마지막 세트면 운동 완료)
 *   onUndoSet: () => void,     마지막 세트 취소 (완료 카드를 탭해도 동일)
 *   onRestore: () => void,     건너뛴 운동 되돌리기
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
  onCompleteSet,
  onUndoSet,
  onRestore,
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
  const doneSets = doneSetsOf(item);

  // 끝난 카드: 흐리게. 완료 카드를 탭하면 마지막 세트 취소, 건너뛴 카드를 탭하면 되돌리기
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
        {!done && <Tag>건너뜀{doneSets > 0 && ` · ${doneSets}/${item.sets}세트`}</Tag>}
        <span className="text-xs text-slate-400">{done ? `${item.sets}세트 · 탭하면 취소` : '탭하면 되돌리기'}</span>
      </button>
    );
  }

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
      <div className="flex items-center">
        <h3 className="text-lg leading-snug font-bold">{name}</h3>
        <GuideButton exerciseId={item.exerciseId} onOpen={onGuide} />
      </div>
      {/* 기구·부위 줄 오른쪽에 세트 진행 (운동 이름이 한 줄을 다 쓰도록) */}
      <div className="-mt-1 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-slate-500">
          {exercise ? (
            <>
              {equipment.emoji} {equipment.name} · {TARGETS[exercise.target].label}
            </>
          ) : (
            '직접 입력한 운동'
          )}
        </p>
        <SetDots done={doneSets} total={item.sets} onUndo={onUndoSet} />
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
        <Button className="flex-1" onClick={onCompleteSet}>
          ✓ {item.sets > 1 ? `${doneSets + 1}세트 완료` : '완료'}
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

/**
 * 세트 진행 표시: ●●○ 2/3세트. 한 세트 이상 끝냈으면 탭해서 마지막 세트를 취소할 수 있다.
 */
function SetDots({ done, total, onUndo }) {
  const dots = (
    <>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`size-2.5 rounded-full ${i < done ? 'bg-mint-500' : 'bg-slate-200'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-navy-700">
        <span className={done ? 'text-mint-700' : ''}>{done}</span>/{total}세트
      </span>
    </>
  );
  if (done === 0) {
    return <span className="flex min-h-11 shrink-0 items-center gap-2 px-1">{dots}</span>;
  }
  return (
    <button
      type="button"
      onClick={onUndo}
      aria-label={`${done}세트 완료됨. 마지막 세트 취소`}
      className="-mr-2 flex min-h-11 shrink-0 items-center gap-2 rounded-full px-2 active:bg-slate-100"
    >
      {dots}
    </button>
  );
}
