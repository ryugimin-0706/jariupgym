// 임시 시작 화면 (1~4단계 확인용). 5단계에서 홈 화면으로 바뀐다.
import { useNavigate } from 'react-router';
import Button from '../components/Button.jsx';
import MobileLayout from '../components/MobileLayout.jsx';
import { SELECTABLE_EQUIPMENT } from '../data/equipment.js';
import { useGym } from '../hooks/useAppData.jsx';
import { useWorkout } from '../workout/WorkoutContext.jsx';

const ALL_OWNED = SELECTABLE_EQUIPMENT.map((e) => e.id);

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
  const { setGym } = useGym();
  const { workout, dispatch } = useWorkout();

  const start = (equipmentIds) => {
    setGym(equipmentIds);
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
      <div className="mt-4 space-y-3">
        <p className="text-sm text-slate-600">
          샘플 &ldquo;가슴 하는날&rdquo; (운동 6개: 바벨 벤치프레스, 인클라인 덤벨프레스, 펙덱 플라이, 케이블 푸시다운, 푸시업, 랜드마인 프레스)
        </p>
        {workout && (
          <Button variant="mint" size="lg" full onClick={() => navigate('/workout')}>
            진행 중인 운동 이어하기
          </Button>
        )}
        <Button size="lg" full onClick={() => start(ALL_OWNED)}>
          기구 전부 있는 헬스장으로 시작
        </Button>
        <Button variant="outline" size="lg" full onClick={() => start(ALL_OWNED.filter((id) => id !== 'pecdeck'))}>
          펙덱 없는 헬스장으로 시작
        </Button>
      </div>
    </MobileLayout>
  );
}
