// 화면 2. 루틴 방식 선택 — 5단계 임시 버전. 6단계에서 실제 선택 카드로 바뀐다.
import { useNavigate } from 'react-router';
import Button from '../../components/Button.jsx';
import MobileLayout from '../../components/MobileLayout.jsx';
import { useRoutine } from '../../hooks/useAppData.jsx';

/** 임시 샘플 루틴 (홈 확인용) */
const SAMPLE_ROUTINE = {
  source: 'custom',
  splits: [
    {
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
    },
    {
      id: 'sample_back',
      name: '등 하는날',
      exercises: [
        { id: 'b1', exerciseId: 'lat_pulldown', sets: 4 },
        { id: 'b2', exerciseId: 'seated_cable_row', sets: 3 },
        { id: 'b3', exerciseId: 'one_arm_dumbbell_row', sets: 3 },
        { id: 'b4', exerciseId: 'barbell_curl', sets: 3 },
      ],
    },
    {
      id: 'sample_legs',
      name: '하체 하는날',
      exercises: [
        { id: 'l1', exerciseId: 'barbell_back_squat', sets: 4 },
        { id: 'l2', exerciseId: 'leg_press', sets: 3 },
        { id: 'l3', exerciseId: 'leg_extension', sets: 3 },
        { id: 'l4', exerciseId: 'barbell_romanian_deadlift', sets: 3 },
        { id: 'l5', exerciseId: 'leg_curl', sets: 3 },
      ],
    },
  ],
};

export default function RoutineChoice() {
  const navigate = useNavigate();
  const { setRoutine } = useRoutine();

  return (
    <MobileLayout header={<p className="text-sm font-semibold text-mint-600">2 / 2</p>}>
      <h1 className="mt-2 text-2xl font-bold text-navy-700">운동 루틴이 있으신가요?</h1>
      <p className="mt-3 rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy-700">
        🚧 임시 화면이에요. &ldquo;내 루틴이 있어요 / 추천 루틴으로 시작할게요&rdquo; 선택은 6단계에서 만들어요.
      </p>
      <div className="mt-6">
        <Button
          size="lg"
          full
          onClick={() => {
            setRoutine(SAMPLE_ROUTINE);
            navigate('/', { replace: true });
          }}
        >
          샘플 루틴으로 시작 (가슴·등·하체)
        </Button>
      </div>
    </MobileLayout>
  );
}
