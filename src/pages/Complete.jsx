/** 화면 6. 운동 완료 */
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router';
import BottomCTA from '../components/BottomCTA.jsx';
import Button from '../components/Button.jsx';
import MobileLayout from '../components/MobileLayout.jsx';
import { EXERCISES_BY_ID } from '../data/exercises.js';
import { useWorkout } from '../workout/WorkoutContext.jsx';
import { addRecord, dateKey } from '../lib/history.js';
import { loadHistory, loadLastLogs, saveHistory, saveLastLogs } from '../lib/storage.js';
import { mergeLastLogs, progress, swapChainOf } from '../workout/workoutReducer.js';

export default function Complete() {
  const navigate = useNavigate();
  const { workout, dispatch } = useWorkout();
  const finished = workout ? progress(workout).finished : false;

  // 운동별 마지막 기록("지난 기록 불러오기"용)과 운동 기록(대표 화면 현황용) 저장.
  // 같은 세션을 여러 번 저장해도 결과는 같다 (예전 세션은 id가 없어 첫 운동 key로 대신).
  useEffect(() => {
    if (!workout || !finished) return;
    saveLastLogs(mergeLastLogs(loadLastLogs(), workout));
    const { doneSets, volume } = progress(workout);
    saveHistory(
      addRecord(loadHistory(), {
        id: workout.id ?? workout.items[0]?.key,
        date: dateKey(new Date()),
        splitName: workout.splitName,
        doneSets,
        volume: Math.round(volume),
        swapCount: workout.swapCount,
      }),
    );
  }, [workout, finished]);

  if (!workout) return <Navigate to="/" replace />;
  const { done, skipped, doneSets, volume } = progress(workout);
  if (!finished) return <Navigate to="/workout" replace />;

  const swapped = workout.items.filter((i) => i.originalExerciseId);
  const { swapCount } = workout;

  /** 운동 세션을 지우고 대표 화면으로 (바로 다음 운동 고르기 화면이 나오면 또 하라는 느낌이라서) */
  const finish = () => {
    dispatch({ type: 'end' });
    navigate('/', { replace: true });
  };

  return (
    <MobileLayout
      bottom={
        <BottomCTA>
          <Button size="lg" full onClick={finish}>
            운동 마치기
          </Button>
        </BottomCTA>
      }
    >
      <div className="flex flex-col items-center pt-16 text-center">
        <span className="animate-pop text-7xl" aria-hidden>
          🎉
        </span>
        <p className="mt-6 text-sm font-semibold text-mint-600">{workout.splitName}</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-700">오늘 운동 끝!</h1>

        <div className="mt-8 w-full rounded-3xl bg-mint-50 px-6 py-7">
          {swapCount > 0 ? (
            <>
              <p className="text-sm text-mint-700">자리 없을 때</p>
              <p className="mt-1 text-2xl leading-snug font-bold text-navy-900">
                기다리지 않고 <span className="text-mint-600">{swapCount}번</span> 바꿨어요
              </p>
            </>
          ) : (
            <p className="text-lg leading-snug font-bold text-navy-900">
              오늘은 바꾸지 않고
              <br />
              루틴대로 끝냈어요 💪
            </p>
          )}
        </div>

        <dl className="mt-4 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 py-4">
            <dt className="text-xs text-slate-500">총 세트</dt>
            <dd className="mt-1 text-xl font-bold text-navy-700">{doneSets}세트</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 py-4">
            <dt className="text-xs text-slate-500">총 볼륨 (무게 × 횟수)</dt>
            <dd className="mt-1 text-xl font-bold text-navy-700">
              {volume > 0 ? `${Math.round(volume).toLocaleString('ko-KR')}kg` : '-'}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-100 py-4">
            <dt className="text-xs text-slate-500">완료</dt>
            <dd className="mt-1 text-xl font-bold text-navy-700">{done}개</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 py-4">
            <dt className="text-xs text-slate-500">건너뜀</dt>
            <dd className="mt-1 text-xl font-bold text-navy-700">{skipped}개</dd>
          </div>
        </dl>

        {swapped.length > 0 && (
          <section className="mt-6 w-full text-left">
            <h2 className="mb-2 text-sm font-semibold text-slate-500">오늘 바꾼 운동</h2>
            <ul className="space-y-2">
              {swapped.map((item) => (
                <li key={item.key} className="rounded-2xl border border-slate-100 px-4 py-3 text-sm leading-relaxed">
                  {swapChainOf(item).map((id, i) => (
                    <span key={`${i}-${id}`}>
                      <span className="text-slate-400 line-through">{EXERCISES_BY_ID[id].name}</span>
                      <span className="mx-1.5 text-mint-600">→</span>
                    </span>
                  ))}
                  <span className="font-semibold text-navy-900">{EXERCISES_BY_ID[item.exerciseId].name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </MobileLayout>
  );
}
