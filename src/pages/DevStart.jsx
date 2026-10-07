// 임시 시작 화면 (1~4단계 확인용). 5단계에서 홈 화면으로 바뀐다.
import { useNavigate } from 'react-router';
import Button from '../components/Button.jsx';
import MobileLayout from '../components/MobileLayout.jsx';
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { useGym } from '../hooks/useAppData.jsx';
import { useWorkout } from '../workout/WorkoutContext.jsx';

/** 샘플 "가슴 하는날": 시나리오 A + 맨몸·직접 입력 운동 */
const SAMPLE_SPLIT = {
  id: 'sample_chest',
  name: '가슴 하는날',
  exercises: [
    { id: 's1', exerciseId: 'barbell_bench_press', sets: 3 },
    { id: 's2', exerciseId: 'incline_dumbbell_press', sets: 3 },
    { id: 's3', exerciseId: 'pec_deck_fly', sets: 3 },
    { id: 's4', exerciseId: 'cable_pushdown', sets: 4 },
    { id: 's5', exerciseId: 'push_up', sets: 2 },
    { id: 's6', exerciseId: null, customName: '랜드마인 프레스', sets: 3 },
  ],
};

export default function DevStart() {
  const navigate = useNavigate();
  const { equipmentIds, hasGym } = useGym();
  const { workout, dispatch } = useWorkout();

  const start = () => {
    dispatch({ type: 'start', split: SAMPLE_SPLIT });
    navigate('/workout');
  };

  return (
    <MobileLayout
      header={
        <>
          <p className="text-xs font-semibold text-mint-600">임시 시작 화면</p>
          <h1 className="text-xl font-bold text-navy-700">자리없Gym</h1>
        </>
      }
    >
      <section className="mt-4 rounded-2xl border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">내 헬스장 기구</h2>
          <Button variant="outline" onClick={() => navigate('/onboarding/equipment')}>
            {hasGym ? '수정' : '등록하기'}
          </Button>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {hasGym
            ? `${equipmentIds.length}개: ${equipmentIds.map((id) => EQUIPMENT_BY_ID[id].name).join(', ')}`
            : '아직 등록하지 않았어요'}
        </p>
      </section>

      <div className="mt-6 space-y-3">
        <p className="text-sm text-slate-600">
          샘플 &ldquo;가슴 하는날&rdquo; (운동 6개: 바벨 벤치프레스, 인클라인 덤벨프레스, 펙덱 플라이, 케이블 푸시다운, 푸시업, 랜드마인 프레스)
        </p>
        {workout && (
          <Button variant="mint" size="lg" full onClick={() => navigate('/workout')}>
            진행 중인 운동 이어하기
          </Button>
        )}
        <Button size="lg" full disabled={!hasGym} onClick={start}>
          {hasGym ? '내 기구로 샘플 운동 시작' : '기구를 먼저 등록해 주세요'}
        </Button>
      </div>
    </MobileLayout>
  );
}
