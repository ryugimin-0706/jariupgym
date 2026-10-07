/** 화면 5. 대체 운동 추천 (바텀시트) */
import BottomSheet from '../components/BottomSheet.jsx';
import { GuideButton } from '../components/ExerciseGuide.jsx';
import Button from '../components/Button.jsx';
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { getSubstitutes } from '../lib/recommend.js';
import { josa } from '../lib/text.js';
import { todayExerciseIds } from '../workout/workoutReducer.js';

/**
 * @param {{
 *   workout: import('../workout/workoutReducer.js').WorkoutState,
 *   target: { key: string, reason: 'busy' | 'missing' } | null,
 *   ownedEquipmentIds: string[],
 *   onClose: () => void,
 *   onPick: (exerciseId: string) => void,
 *   onDefer: () => void,
 *   onSkip: () => void,
 *   onAddEquipment: () => void,
 *   onGuide: (exerciseId: string) => void,  운동 방법 보기 (시트는 Workout에서 띄움)
 * }} props
 */
export default function SubstituteSheet({
  workout,
  target,
  ownedEquipmentIds,
  onClose,
  onPick,
  onDefer,
  onSkip,
  onAddEquipment,
  onGuide,
}) {
  const item = target ? workout.items.find((i) => i.key === target.key) : null;
  const exercise = item?.exerciseId ? EXERCISES_BY_ID[item.exerciseId] : null;
  if (!item || !exercise) return <BottomSheet open={false} onClose={onClose} title="" />;

  const equipmentName = EQUIPMENT_BY_ID[exercise.equipmentId].name;
  const suggestions = getSubstitutes(exercise.id, {
    ownedEquipmentIds,
    busyEquipmentIds: workout.busyEquipmentIds,
    excludeExerciseIds: todayExerciseIds(workout),
  });
  const empty = suggestions.length === 0;

  const title =
    target.reason === 'busy'
      ? `${josa(equipmentName, '이', '가')} 사용 중이에요`
      : `${josa(equipmentName, '은', '는')} 내 헬스장에 없어요`;

  return (
    <BottomSheet open onClose={onClose} title={title}>
      <p className="-mt-2 mb-4 text-sm text-slate-500">
        {empty ? (
          <>지금 대체할 수 있는 운동이 없어요. 다른 운동을 먼저 하고 기구가 비면 돌아오세요.</>
        ) : (
          <>
            <b className="text-navy-700">{exercise.name}</b> 대신 이 운동은 어때요?
          </>
        )}
      </p>

      {!empty && (
        <ul className="space-y-2">
          {suggestions.map(({ exercise: candidate, reason }, i) => {
            const eq = EQUIPMENT_BY_ID[candidate.equipmentId];
            return (
              <li
                key={candidate.id}
                className={`flex items-center rounded-2xl border ${
                  i === 0 ? 'border-mint-500 bg-mint-50' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onPick(candidate.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-l-2xl p-4 pr-2 text-left transition active:scale-[0.99] active:bg-black/5"
                >
                  <span className="text-2xl" aria-hidden>
                    {eq.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="font-bold text-navy-900">{candidate.name}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-mint-700 px-2 py-0.5 text-[11px] font-bold text-white">
                          추천
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{reason}</span>
                  </span>
                  <span className="text-lg text-mint-600" aria-hidden>
                    ›
                  </span>
                </button>
                <span className="h-8 w-px bg-slate-200" aria-hidden />
                <GuideButton exerciseId={candidate.id} onOpen={onGuide} className="mx-1" />
              </li>
            );
          })}
        </ul>
      )}

      <div className={`flex gap-2 ${empty ? 'flex-col' : 'mt-4'}`}>
        <Button variant={empty ? 'primary' : 'outline'} size={empty ? 'lg' : 'md'} className="flex-1" onClick={onDefer}>
          순서 뒤로 미루기
        </Button>
        <Button variant="ghost" className="flex-1" onClick={onSkip}>
          이번엔 건너뛰기
        </Button>
      </div>

      {target.reason === 'missing' && (
        <button
          type="button"
          onClick={onAddEquipment}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-600 active:bg-slate-100"
        >
          우리 헬스장에 있어요 ·&nbsp;<b className="text-mint-700">{equipmentName} 추가</b>
        </button>
      )}
    </BottomSheet>
  );
}
