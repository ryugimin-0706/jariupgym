const TONES = {
  mint: 'bg-mint-50 text-mint-700',
  coral: 'bg-coral-50 text-coral-700',
  navy: 'bg-navy-50 text-navy-700',
  gray: 'bg-slate-100 text-slate-500',
};

/** 작은 상태 태그 ("기구 없음", "내 헬스장 맞춤", "건너뜀" 등) */
export default function Tag({ tone = 'gray', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}
