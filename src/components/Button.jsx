const VARIANTS = {
  primary: 'bg-navy-700 text-white active:bg-navy-900 disabled:bg-slate-200 disabled:text-slate-400',
  mint: 'bg-mint-500 text-white active:bg-mint-600 disabled:bg-slate-200 disabled:text-slate-400',
  coral: 'bg-coral-50 text-coral-700 ring-1 ring-coral-100 active:bg-coral-100 disabled:opacity-40',
  outline: 'bg-white text-navy-700 ring-1 ring-slate-200 active:bg-slate-50 disabled:opacity-40',
  ghost: 'bg-transparent text-slate-500 active:bg-slate-100 disabled:opacity-40',
};

const SIZES = {
  lg: 'min-h-14 px-5 text-base',
  md: 'min-h-11 px-4 text-sm',
};

/**
 * 최소 터치 영역 44px(min-h-11) 보장.
 * @param {{ variant?: keyof VARIANTS, size?: keyof SIZES, full?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({ variant = 'primary', size = 'md', full = false, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    />
  );
}
