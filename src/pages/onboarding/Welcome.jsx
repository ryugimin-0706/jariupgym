/**
 * 대표 화면: 앱을 열 때와 운동을 마친 뒤 항상 먼저 보인다. 핵심 동작 "자리 없음 → 대체"를 데모 카드로 보여준다.
 * 아래 버튼과 문구는 상황에 따라 바뀐다: 처음(설정 안내) / 설정 중 / 설정 끝(오늘 운동 고르기) / 운동 중(이어서).
 */
import { useNavigate } from 'react-router';
import BottomCTA from '../../components/BottomCTA.jsx';
import Button from '../../components/Button.jsx';
import MobileLayout from '../../components/MobileLayout.jsx';
import { useGym, useRoutine } from '../../hooks/useAppData.jsx';
import { useWorkout } from '../../workout/WorkoutContext.jsx';
import { progress } from '../../workout/workoutReducer.js';

const FEATURES = [
  { emoji: '🏋️', text: '내 헬스장에 있는 기구로만' },
  { emoji: '🎯', text: '같은 부위 운동으로 대체' },
  { emoji: '⚡', text: '탭 한 번으로 오늘 루틴 변경' },
];

/** 지금 상황에 맞는 [시작하기] 목적지와 안내 문구 */
function useStartState() {
  const { equipmentIds, hasGym } = useGym();
  const { routine } = useRoutine();
  const { workout } = useWorkout();

  if (!hasGym) return { kind: 'new', to: '/onboarding/equipment', label: '시작하기', hint: '1분이면 설정 끝 · 로그인 없음' };
  if (!routine) return { kind: 'setup', to: '/onboarding/routine', label: '이어서 설정하기', hint: `🏋️ 기구 ${equipmentIds.length}개 등록 완료 · 루틴만 정하면 끝` };
  if (workout) {
    const { done, total } = progress(workout);
    return { kind: 'ongoing', to: '/workout', label: '이어서 운동하기', hint: `🏃 ${workout.splitName} 진행 중 · ${done}/${total} 완료` };
  }
  return { kind: 'ready', to: '/home', label: '시작하기', hint: `🏋️ 내 헬스장 기구 ${equipmentIds.length}개 · 루틴 ${routine.splits.length}개 준비됨` };
}

export default function Welcome() {
  const navigate = useNavigate();
  const start = useStartState();
  const returning = start.kind !== 'new';

  return (
    <MobileLayout
      bottom={
        <BottomCTA>
          <Button size="lg" full onClick={() => navigate(start.to)}>
            {start.label}
          </Button>
          {start.kind === 'ongoing' ? (
            <button type="button" onClick={() => navigate('/home')} className="w-full text-center text-xs text-slate-500 underline-offset-2 active:underline">
              {start.hint} · <span className="font-semibold text-navy-700">다른 운동 고르기 ›</span>
            </button>
          ) : (
            <p className="text-center text-xs text-slate-400">{start.hint}</p>
          )}
        </BottomCTA>
      }
    >
      <div className="flex items-center justify-between pt-6">
        <p className="text-lg font-black tracking-tight text-navy-700">
          자리없<span className="text-mint-500">Gym</span>
        </p>
        {returning && (
          <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-700">👋 다시 오셨네요</span>
        )}
      </div>

      <h1 className="mt-8 text-[28px] leading-tight font-bold text-navy-700">
        루틴은 있는데,
        <br />
        자리가 없다면
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
        기다리거나 건너뛰지 마세요.
        <br />
        지금 비어 있는 기구로 오늘 루틴을 바로 바꿔드려요.
      </p>

      {/* 데모: 운동 화면 카드와 같은 모양 */}
      <div className="mt-8" aria-hidden>
        <div className="demo-dim flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div>
            <p className="font-bold text-navy-900">바벨 벤치프레스</p>
            <p className="mt-0.5 text-xs text-slate-500">🛋️ 벤치프레스 · 가슴</p>
          </div>
          <span className="demo-press rounded-xl bg-white px-3 py-2 text-sm font-semibold text-coral-700 ring-1 ring-coral-500">
            자리 없음
          </span>
        </div>

        <p className="demo-reveal py-1.5 text-center text-lg text-mint-500">↓</p>

        <div className="demo-reveal-late rounded-2xl border border-mint-500 bg-mint-50 p-4">
          <p className="text-xs font-medium text-mint-700">
            <span className="text-slate-400 line-through">바벨 벤치프레스</span> → 덤벨 벤치프레스
          </p>
          <p className="mt-1 font-bold text-navy-900">덤벨 벤치프레스</p>
          <p className="mt-0.5 text-xs text-mint-700">같은 가슴 운동 · 비어 있는 덤벨 사용</p>
        </div>
      </div>
      <p className="sr-only">
        예시: 바벨 벤치프레스 자리가 없으면 같은 가슴 운동인 덤벨 벤치프레스로 바로 바꿔요.
      </p>

      <ul className="mt-8 space-y-2.5">
        {FEATURES.map((f) => (
          <li key={f.text} className="flex items-center gap-3 text-[15px] text-navy-900">
            <span className="flex size-9 items-center justify-center rounded-xl bg-mint-50 text-lg" aria-hidden>
              {f.emoji}
            </span>
            {f.text}
          </li>
        ))}
      </ul>
    </MobileLayout>
  );
}
