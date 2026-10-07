import { useNavigate } from 'react-router';

/**
 * 뒤로가기 버튼 + 제목(또는 단계 표시) 헤더.
 * @param {{ title?: React.ReactNode, step?: string, onBack?: () => void, right?: React.ReactNode }} props
 */
export default function PageHeader({ title, step, onBack, right }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        className="-ml-2 flex size-11 items-center justify-center rounded-full text-2xl text-navy-700 active:bg-slate-100"
        aria-label="뒤로"
      >
        ‹
      </button>
      {title && <h1 className="flex-1 text-xl font-bold text-navy-700">{title}</h1>}
      {step && <p className="flex-1 text-sm font-semibold text-mint-600">{step}</p>}
      {right}
    </div>
  );
}
