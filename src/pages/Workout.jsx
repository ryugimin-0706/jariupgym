/** 화면 4. 운동 진행 */
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import ExerciseCard from '../components/ExerciseCard.jsx';
import HorizontalScroller from '../components/HorizontalScroller.jsx';
import MobileLayout from '../components/MobileLayout.jsx';
import Toast, { useToast } from '../components/Toast.jsx';
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { useGym } from '../hooks/useAppData.jsx';
import { canMarkBusy, isOwned, swapToastMessage } from '../lib/recommend.js';
import { useWorkout } from '../workout/WorkoutContext.jsx';
import { progress } from '../workout/workoutReducer.js';
import { josa } from '../lib/text.js';
import SubstituteSheet from './SubstituteSheet.jsx';

const HIGHLIGHT_MS = 1600;
/** 마지막 운동을 끝내고 완료 화면으로 넘어가기까지 (체크 표시를 보고, 잘못 눌렀으면 취소할 틈) */
const FINISH_DELAY_MS = 700;

export default function Workout() {
  const navigate = useNavigate();
  const { workout, dispatch } = useWorkout();
  const { equipmentIds, addEquipment } = useGym();
  const { toast, show: showToast } = useToast();
  /** 바텀시트 대상: 'busy' = 자리 없음, 'missing' = 내 헬스장에 없는 기구 */
  const [sheet, setSheet] = useState(/** @type {{ key: string, reason: 'busy' | 'missing' } | null} */ (null));

  const lastSwappedKey = workout?.lastSwappedKey;
  useEffect(() => {
    if (!lastSwappedKey) return undefined;
    const t = setTimeout(() => dispatch({ type: 'clearHighlight' }), HIGHLIGHT_MS);
    return () => clearTimeout(t);
  }, [lastSwappedKey, dispatch]);

  const finished = workout ? progress(workout).finished : false;
  useEffect(() => {
    if (!finished) return undefined;
    // replace: 완료 화면에서 뒤로가기를 눌러도 운동 화면으로 돌아오지 않게
    const t = setTimeout(() => navigate('/complete', { replace: true }), FINISH_DELAY_MS);
    return () => clearTimeout(t);
  }, [finished, navigate]);

  const closeSheet = useCallback(() => setSheet(null), []);

  if (!workout) return <Navigate to="/" replace />;

  const { total, done, skipped } = progress(workout);
  const processedPct = total ? ((done + skipped) / total) * 100 : 0;

  /** "자리 없음": 기구를 사용 중으로 표시하고 대체 추천을 연다. 없는 기구면 표시 없이 대체 추천만. */
  const openSubstitutes = (item) => {
    const exercise = EXERCISES_BY_ID[item.exerciseId];
    if (isOwned(exercise.equipmentId, equipmentIds)) {
      dispatch({ type: 'markBusy', equipmentId: exercise.equipmentId });
      setSheet({ key: item.key, reason: 'busy' });
    } else {
      setSheet({ key: item.key, reason: 'missing' });
    }
  };

  const pick = (exerciseId) => {
    dispatch({ type: 'substitute', key: sheet.key, exerciseId });
    setSheet(null);
    showToast(swapToastMessage(exerciseId));
  };

  const deferFromSheet = () => {
    dispatch({ type: 'defer', key: sheet.key });
    setSheet(null);
    showToast('순서를 뒤로 미뤘어요. 다른 운동 먼저 해요');
  };

  /** 내 헬스장에 없던 기구를 바로 등록 → 카드가 일반 운동으로 돌아온다 */
  const addMissingEquipment = (exerciseId) => {
    const equipment = EQUIPMENT_BY_ID[EXERCISES_BY_ID[exerciseId].equipmentId];
    addEquipment(equipment.id);
    setSheet(null);
    showToast(`${josa(equipment.name, '을', '를')} 내 기구에 추가했어요`);
  };

  const skipFromSheet = () => {
    dispatch({ type: 'skip', key: sheet.key });
    setSheet(null);
  };

  return (
    <MobileLayout
      header={
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="-ml-2 flex size-11 items-center justify-center rounded-full text-2xl text-navy-700 active:bg-slate-100"
              aria-label="뒤로"
            >
              ‹
            </button>
            <h1 className="flex-1 text-xl font-bold text-navy-700">{workout.splitName}</h1>
            <p className="text-sm font-semibold text-navy-700">
              <span className="text-mint-600">{done}</span>/{total} 완료
              {skipped > 0 && <span className="font-normal text-slate-400"> · {skipped}개 건너뜀</span>}
            </p>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={done + skipped}
            aria-valuemax={total}
          >
            <div
              className="h-full rounded-full bg-mint-500 transition-all duration-500"
              style={{ width: `${processedPct}%` }}
            />
          </div>

          {workout.busyEquipmentIds.length > 0 && (
            <HorizontalScroller className="mt-3">
              {workout.busyEquipmentIds.map((id) => {
                const eq = EQUIPMENT_BY_ID[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => dispatch({ type: 'releaseBusy', equipmentId: id })}
                    className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-coral-50 whitespace-nowrap py-1 pr-1.5 pl-3 text-sm text-coral-700 ring-1 ring-coral-100 active:bg-coral-100"
                  >
                    <span>
                      {eq.emoji} {eq.name} 사용 중
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-mint-700">
                      다시 비었어요
                    </span>
                  </button>
                );
              })}
            </HorizontalScroller>
          )}
        </>
      }
    >
      <ul className="space-y-3">
        {workout.items.map((item) => {
          const exercise = item.exerciseId ? EXERCISES_BY_ID[item.exerciseId] : null;
          return (
            <li key={item.key}>
              <ExerciseCard
                item={item}
                owned={exercise ? isOwned(exercise.equipmentId, equipmentIds) : true}
                busy={exercise ? workout.busyEquipmentIds.includes(exercise.equipmentId) : false}
                canMarkBusy={canMarkBusy(item.exerciseId)}
                highlight={workout.lastSwappedKey === item.key}
                onToggleDone={() => dispatch({ type: 'toggleDone', key: item.key })}
                onBusy={() => openSubstitutes(item)}
                onDefer={() => dispatch({ type: 'defer', key: item.key })}
                onSkip={() => dispatch({ type: 'skip', key: item.key })}
                onAddEquipment={() => addMissingEquipment(item.exerciseId)}
              />
            </li>
          );
        })}
      </ul>

      <SubstituteSheet
        workout={workout}
        target={sheet}
        ownedEquipmentIds={equipmentIds}
        onClose={closeSheet}
        onPick={pick}
        onDefer={deferFromSheet}
        onSkip={skipFromSheet}
        onAddEquipment={() => addMissingEquipment(workout.items.find((i) => i.key === sheet.key).exerciseId)}
      />
      <Toast toast={toast} />
    </MobileLayout>
  );
}
