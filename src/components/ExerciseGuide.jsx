/** 운동 방법 안내: ⓘ 버튼 + 바텀시트 (짧은 설명 3단계, 주의점, 영상 검색) */
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISE_GUIDES, videoSearchUrl } from '../data/exerciseGuides.js';
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { TARGETS } from '../data/taxonomy.js';
import BottomSheet from './BottomSheet.jsx';

/**
 * 운동 이름 옆 ⓘ 버튼. 직접 입력한 운동처럼 설명이 없으면 그리지 않는다.
 * @param {{ exerciseId: string | null | undefined, onOpen: (exerciseId: string) => void, className?: string }} props
 */
export function GuideButton({ exerciseId, onOpen, className = '' }) {
  if (!exerciseId || !EXERCISE_GUIDES[exerciseId]) return null;
  const name = EXERCISES_BY_ID[exerciseId].name;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen(exerciseId);
      }}
      aria-label={`${name} 운동 방법`}
      className={`-my-2 flex size-11 shrink-0 items-center justify-center rounded-full text-slate-400 active:bg-slate-100 ${className}`}
    >
      <span className="flex size-5 items-center justify-center rounded-full border-[1.5px] border-current text-[11px] font-bold">
        i
      </span>
    </button>
  );
}

/**
 * 운동 방법 바텀시트. 다른 시트(대체 추천, 운동 담기) 위에 열릴 수 있다.
 * @param {{ exerciseId: string | null, onClose: () => void }} props
 */
export function GuideSheet({ exerciseId, onClose }) {
  const exercise = exerciseId ? EXERCISES_BY_ID[exerciseId] : null;
  const guide = exerciseId ? EXERCISE_GUIDES[exerciseId] : null;
  if (!exercise || !guide) return <BottomSheet open={false} onClose={onClose} title="" />;

  const eq = EQUIPMENT_BY_ID[exercise.equipmentId];
  return (
    <BottomSheet open onClose={onClose} title={exercise.name}>
      <p className="-mt-3 mb-4 text-sm text-slate-500">
        {eq.emoji} {eq.name} · {TARGETS[exercise.target].label}
      </p>

      <ol className="space-y-3">
        {guide.steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 text-[15px] leading-snug text-navy-900">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 flex gap-2 rounded-xl bg-coral-50 px-3 py-2.5 text-sm text-coral-700">
        <span aria-hidden>⚠️</span>
        <span>{guide.caution}</span>
      </p>

      <a
        href={videoSearchUrl(exercise.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-navy-700 ring-1 ring-slate-200 active:bg-slate-50"
      >
        ▶ 영상으로 보기 <span className="text-xs font-normal text-slate-400">YouTube 검색</span>
      </a>
    </BottomSheet>
  );
}
