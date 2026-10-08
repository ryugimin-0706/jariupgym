/** 화면 4. 운동 진행 */
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import BottomSheet from '../components/BottomSheet.jsx';
import Button from '../components/Button.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import { GuideSheet } from '../components/ExerciseGuide.jsx';
import HorizontalScroller from '../components/HorizontalScroller.jsx';
import MobileLayout from '../components/MobileLayout.jsx';
import Toast, { useToast } from '../components/Toast.jsx';
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { useGym, useRoutine } from '../hooks/useAppData.jsx';
import { makeId } from '../lib/routine.js';
import { loadLastLogs } from '../lib/storage.js';
import { canMarkBusy, isOwned, swapToastMessage } from '../lib/recommend.js';
import { useWorkout } from '../workout/WorkoutContext.jsx';
import { DEFAULT_ADDED_SETS, progress, swapChainOf } from '../workout/workoutReducer.js';
import { josa } from '../lib/text.js';
import ExercisePicker from './onboarding/ExercisePicker.jsx';
import SubstituteSheet from './SubstituteSheet.jsx';

const HIGHLIGHT_MS = 1600;
/** 마지막 운동을 끝내고 완료 화면으로 넘어가기까지 (체크 표시를 보고, 잘못 눌렀으면 취소할 틈) */
const FINISH_DELAY_MS = 700;

export default function Workout() {
  const navigate = useNavigate();
  const { workout, dispatch } = useWorkout();
  const { equipmentIds, addEquipment } = useGym();
  /** 운동별 마지막 기록 ("지난 기록 불러오기"). 운동을 끝내면 완료 화면에서 갱신된다. */
  const [lastLogs] = useState(loadLastLogs);
  const { toast, show: showToast } = useToast();
  /** 바텀시트 대상: 'busy' = 자리 없음, 'missing' = 내 헬스장에 없는 기구 */
  const [sheet, setSheet] = useState(/** @type {{ key: string, reason: 'busy' | 'missing' } | null} */ (null));
  /** 운동 방법 시트 (카드·대체 추천 시트 어디서든 열 수 있어 여기서 띄운다) */
  const [guideId, setGuideId] = useState(null);
  /** 운동 중 종목 추가 시트. 시트를 연 뒤 추가한 운동 key를 모아, 닫을 때 "내 루틴에도 넣을까요?"를 묻는다 */
  const [adding, setAdding] = useState(false);
  const [sessionKeys, setSessionKeys] = useState([]);
  const [askRoutineKeys, setAskRoutineKeys] = useState(null);
  const { routine, setRoutine } = useRoutine();

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

  // ── 운동 중 종목 추가 ──
  /** 오늘 운동을 시작한 분할 (루틴을 고쳐서 없어졌을 수 있음) */
  const routineSplit = routine?.splits.find((s) => s.id === workout.splitId) ?? null;

  /** 루틴의 해당 분할 운동 목록을 고친다. 운동 중에 루틴을 바꾸면 내 루틴(custom)이 된다. */
  const updateRoutineSplit = (fn) =>
    setRoutine({
      ...routine,
      source: 'custom',
      splits: routine.splits.map((s) => (s.id === routineSplit.id ? { ...s, exercises: fn(s.exercises) } : s)),
    });

  const nameOf = (item) => (item.exerciseId ? EXERCISES_BY_ID[item.exerciseId].name : item.customName);

  const openAdding = () => {
    setSessionKeys([]);
    setAdding(true);
  };

  const addToWorkout = ({ exerciseId = null, customName }) => {
    const key = makeId('w');
    dispatch({ type: 'addExercise', exerciseId, customName, newKey: key });
    setSessionKeys((keys) => [...keys, key]);
    showToast(`${josa(exerciseId ? EXERCISES_BY_ID[exerciseId].name : customName, '을', '를')} 추가했어요`);
  };

  /** 담기 시트를 닫을 때: 이번에 추가한 운동이 있으면 루틴에도 넣을지 묻는다 */
  const closeAdding = () => {
    setAdding(false);
    const keys = sessionKeys.filter((key) => workout.items.some((i) => i.key === key));
    if (keys.length && routineSplit) setAskRoutineKeys(keys);
  };

  /** "예": 이번에 추가한 운동을 저장 루틴의 그 분할에도 넣는다 (이미 있으면 넣지 않음) */
  const addSessionToRoutine = () => {
    const additions = [];
    for (const key of askRoutineKeys) {
      const item = workout.items.find((i) => i.key === key);
      if (!item) continue;
      const exists = routineSplit.exercises.some((e) =>
        item.exerciseId ? e.exerciseId === item.exerciseId : !e.exerciseId && e.customName === item.customName,
      );
      if (exists) continue;
      const routineExerciseId = makeId('e');
      additions.push({
        id: routineExerciseId,
        exerciseId: item.exerciseId,
        ...(item.customName ? { customName: item.customName } : {}),
        sets: DEFAULT_ADDED_SETS,
      });
      dispatch({ type: 'linkRoutine', key, routineExerciseId });
    }
    if (additions.length) updateRoutineSplit((list) => [...list, ...additions]);
    setAskRoutineKeys(null);
    showToast(`내 루틴(${routineSplit.name})에도 넣었어요`);
  };

  /** 추가한 운동 빼기 ("내 루틴에도 추가"로 넣었다면 루틴에서도 뺀다) */
  const removeFromWorkout = (key) => {
    const item = workout.items.find((i) => i.key === key);
    if (!item?.added) return;
    if (item.routineExerciseId && routineSplit) {
      updateRoutineSplit((list) => list.filter((e) => e.id !== item.routineExerciseId));
    }
    dispatch({ type: 'removeExercise', key });
    setSessionKeys((keys) => keys.filter((k) => k !== key));
    showToast('추가한 운동을 뺐어요');
  };

  /** 담기 시트에 넘길 오늘 운동 목록: 원래 루틴 운동(대체 전 운동 포함)은 잠금, 추가한 운동만 뺄 수 있다 */
  const pickerSplit = adding
    ? {
        id: 'workout',
        name: workout.splitName,
        exercises: workout.items.flatMap((i) => [
          { id: i.key, exerciseId: i.exerciseId, customName: i.customName, locked: !i.added },
          ...swapChainOf(i).map((id) => ({ id: `${i.key}-${id}`, exerciseId: id, locked: true })),
        ]),
      }
    : null;

  const pending = workout.items.filter((i) => i.status === 'pending');
  const finishedItems = workout.items.filter((i) => i.status !== 'pending');

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
        {[...pending, null, ...finishedItems].map((item) => {
          // 진행 중 운동과 끝난 운동 사이에 [＋ 운동 추가]
          if (!item) {
            return (
              <li key="add-exercise">
                <button
                  type="button"
                  onClick={openAdding}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-semibold text-navy-700 active:bg-slate-50"
                >
                  ＋ 운동 추가
                </button>
              </li>
            );
          }
          const exercise = item.exerciseId ? EXERCISES_BY_ID[item.exerciseId] : null;
          return (
            <li key={item.key}>
              <ExerciseCard
                item={item}
                owned={exercise ? isOwned(exercise.equipmentId, equipmentIds) : true}
                busy={exercise ? workout.busyEquipmentIds.includes(exercise.equipmentId) : false}
                canMarkBusy={canMarkBusy(item.exerciseId)}
                highlight={workout.lastSwappedKey === item.key}
                hasRecord={Boolean(item.exerciseId && lastLogs[item.exerciseId]?.length)}
                onToggleSet={(index) => dispatch({ type: 'toggleSet', key: item.key, index })}
                onUpdateSet={(index, patch) => dispatch({ type: 'updateSet', key: item.key, index, ...patch })}
                onUndoSet={() => dispatch({ type: 'undoSet', key: item.key })}
                onAddSet={() => dispatch({ type: 'addSet', key: item.key })}
                onRemoveSet={() => dispatch({ type: 'removeSet', key: item.key })}
                onLoad={() => {
                  dispatch({ type: 'loadSets', key: item.key, rows: lastLogs[item.exerciseId] });
                  showToast('지난 기록을 불러왔어요');
                }}
                onRestore={() => dispatch({ type: 'restore', key: item.key })}
                onBusy={() => openSubstitutes(item)}
                onDefer={() => dispatch({ type: 'defer', key: item.key })}
                onSkip={() => dispatch({ type: 'skip', key: item.key })}
                onAddEquipment={() => addMissingEquipment(item.exerciseId)}
                onGuide={setGuideId}
                onRemoveExercise={() => removeFromWorkout(item.key)}
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
        onGuide={setGuideId}
      />
      <ExercisePicker
        split={pickerSplit}
        title="오늘 운동에 추가"
        busyEquipmentIds={workout.busyEquipmentIds}
        onClose={closeAdding}
        onAdd={(exerciseId) => addToWorkout({ exerciseId })}
        onAddCustom={(customName) => addToWorkout({ customName })}
        onRemove={removeFromWorkout}
      />
      <BottomSheet open={!!askRoutineKeys} onClose={() => setAskRoutineKeys(null)} title="내 루틴에도 추가할까요?">
        <p className="-mt-2 text-sm leading-relaxed text-slate-500">
          방금 추가한 운동을 <b className="text-navy-700">{routineSplit?.name}</b>에도 넣으면, 다음에 이 분할을 시작할
          때도 들어가요.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(askRoutineKeys ?? []).map((key) => {
            const item = workout.items.find((i) => i.key === key);
            return item ? (
              <li key={key} className="rounded-full bg-mint-50 px-3 py-1.5 text-sm font-medium text-mint-700">
                {nameOf(item)}
              </li>
            ) : null;
          })}
        </ul>
        <div className="mt-5 flex flex-col gap-2">
          <Button size="lg" full onClick={addSessionToRoutine}>
            예, 내 루틴에도 추가
          </Button>
          <Button variant="ghost" full onClick={() => setAskRoutineKeys(null)}>
            아니요, 오늘만 할게요
          </Button>
        </div>
      </BottomSheet>
      <GuideSheet exerciseId={guideId} onClose={() => setGuideId(null)} />
      <Toast toast={toast} />
    </MobileLayout>
  );
}
