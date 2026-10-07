/** 화면 3. 홈 — 오늘 할 분할 선택 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import BottomSheet from '../components/BottomSheet.jsx';
import Button from '../components/Button.jsx';
import MobileLayout from '../components/MobileLayout.jsx';
import Tag from '../components/Tag.jsx';
import { useAppData, useRoutine } from '../hooks/useAppData.jsx';
import { summarizeSplit } from '../lib/routine.js';
import { clearAll } from '../lib/storage.js';
import { josa } from '../lib/text.js';
import { useWorkout } from '../workout/WorkoutContext.jsx';
import { progress } from '../workout/workoutReducer.js';

export default function Home() {
  const navigate = useNavigate();
  const { routine } = useRoutine();
  const { resetAll } = useAppData();
  const { workout, dispatch } = useWorkout();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  /** 진행 중인 운동이 있을 때 다른 분할을 누르면 확인 */
  const [pendingSplit, setPendingSplit] = useState(null);

  const ongoing = workout ? progress(workout) : null;

  const start = (split) => {
    dispatch({ type: 'start', split });
    navigate('/workout');
  };

  const onSplitTap = (split) => {
    if (workout && workout.splitId === split.id) navigate('/workout');
    else if (workout) setPendingSplit(split);
    else start(split);
  };

  const resetData = () => {
    clearAll();
    dispatch({ type: 'end' });
    resetAll();
    navigate('/welcome', { replace: true });
  };

  return (
    <MobileLayout
      header={
        <div className="flex items-center justify-between">
          <p className="text-lg font-black tracking-tight text-navy-700">
            자리없<span className="text-mint-500">Gym</span>
          </p>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-xl text-slate-500 active:bg-slate-100"
            aria-label="설정"
          >
            ⚙️
          </button>
        </div>
      }
    >
      <h1 className="mt-3 text-2xl font-bold text-navy-700">오늘은 어떤 운동을 하나요?</h1>

      {workout && (
        <button
          type="button"
          onClick={() => navigate('/workout')}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-mint-700 p-4 text-left text-white active:bg-mint-800"
        >
          <span className="text-2xl" aria-hidden>
            🏃
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs opacity-90">
              진행 중 · {ongoing.done}/{ongoing.total} 완료
            </span>
            <span className="block truncate font-bold">{workout.splitName}</span>
          </span>
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold">이어하기 ›</span>
        </button>
      )}

      <ul className="mt-5 space-y-3">
        {routine.splits.map((split) => {
          const { count, bodyParts } = summarizeSplit(split);
          const isOngoing = workout?.splitId === split.id;
          return (
            <li key={split.id}>
              <button
                type="button"
                onClick={() => onSplitTap(split)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] active:bg-slate-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-bold text-navy-900">{split.name}</span>
                    {isOngoing && <Tag tone="mint">진행 중</Tag>}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-sm text-slate-500">운동 {count}개</span>
                    {bodyParts.slice(0, 3).map((part) => (
                      <Tag key={part} tone="navy">
                        {part}
                      </Tag>
                    ))}
                  </span>
                </span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-700 text-lg text-white" aria-hidden>
                  ▶
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* 진행 중인 운동이 있는데 다른 분할을 눌렀을 때 */}
      <BottomSheet open={!!pendingSplit} onClose={() => setPendingSplit(null)} title="진행 중인 운동이 있어요">
        <p className="-mt-2 mb-5 text-sm text-slate-500">
          <b className="text-navy-700">{josa(workout?.splitName ?? '', '을', '를')}</b> 끝내고{' '}
          <b className="text-navy-700">{josa(pendingSplit?.name ?? '', '을', '를')}</b> 새로 시작할까요? 진행 상황은 사라져요.
        </p>
        <div className="flex flex-col gap-2">
          <Button size="lg" full onClick={() => start(pendingSplit)}>
            새로 시작하기
          </Button>
          <Button variant="ghost" full onClick={() => navigate('/workout')}>
            하던 운동 이어하기
          </Button>
        </div>
      </BottomSheet>

      {/* 설정 */}
      <BottomSheet
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setConfirmReset(false);
        }}
        title="설정"
      >
        {confirmReset ? (
          <>
            <p className="-mt-2 mb-5 text-sm text-slate-500">
              내 헬스장 기구와 내 루틴이 모두 지워지고 처음 화면으로 돌아가요. 되돌릴 수 없어요.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="coral" size="lg" full onClick={resetData}>
                모두 지우기
              </Button>
              <Button variant="ghost" full onClick={() => setConfirmReset(false)}>
                취소
              </Button>
            </div>
          </>
        ) : (
          <ul className="-mx-2">
            <SettingsItem emoji="🏋️" label="내 헬스장 기구 수정" onClick={() => navigate('/settings/equipment')} />
            <SettingsItem emoji="📝" label="내 루틴 수정" onClick={() => navigate('/settings/routine')} />
            <SettingsItem emoji="🗑️" label="데이터 초기화" danger onClick={() => setConfirmReset(true)} />
          </ul>
        )}
      </BottomSheet>
    </MobileLayout>
  );
}

function SettingsItem({ emoji, label, hint, danger, disabled, onClick }) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-2 text-left active:bg-slate-50 disabled:opacity-40 ${
          danger ? 'text-coral-700' : 'text-navy-900'
        }`}
      >
        <span className="text-xl" aria-hidden>
          {emoji}
        </span>
        <span className="flex-1 font-medium">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
        {!disabled && (
          <span className="text-slate-300" aria-hidden>
            ›
          </span>
        )}
      </button>
    </li>
  );
}
