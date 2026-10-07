/** 화면 2. 루틴 방식 선택 */
import { useNavigate } from 'react-router';
import MobileLayout from '../../components/MobileLayout.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Tag from '../../components/Tag.jsx';

export default function RoutineChoice() {
  const navigate = useNavigate();

  return (
    <MobileLayout header={<PageHeader step="2 / 2" onBack={() => navigate('/onboarding/equipment')} />}>
      <h1 className="mt-2 text-2xl font-bold text-navy-700">운동 루틴이 있으신가요?</h1>
      <p className="mt-2 text-sm text-slate-500">나중에 설정에서 언제든 바꿀 수 있어요.</p>

      <div className="mt-8 space-y-4">
        <ChoiceCard
          emoji="📋"
          title="내 루틴이 있어요"
          desc="평소 하던 루틴을 분할별로 등록해요"
          // 7단계에서 화면 2-A로 연결
          disabledHint="7단계에서 연결"
        />
        <ChoiceCard
          emoji="✨"
          title="추천 루틴으로 시작할게요"
          desc="내 헬스장 기구에 맞춘 루틴을 추천해 드려요"
          onClick={() => navigate('/onboarding/recommended')}
        />
      </div>
    </MobileLayout>
  );
}

function ChoiceCard({ emoji, title, desc, onClick, disabledHint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!!disabledHint}
      className="flex w-full items-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-6 text-left shadow-sm transition active:scale-[0.99] active:border-mint-500 active:bg-mint-50 disabled:opacity-50"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-3xl" aria-hidden>
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-navy-900">{title}</span>
          {disabledHint && <Tag>{disabledHint}</Tag>}
        </span>
        <span className="mt-1 block text-sm text-slate-500">{desc}</span>
      </span>
      <span className="text-xl text-slate-300" aria-hidden>
        ›
      </span>
    </button>
  );
}
