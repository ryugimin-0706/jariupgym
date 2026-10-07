import { useEffect } from 'react';

/**
 * 바텀시트. 배경을 탭하거나 Esc를 누르면 닫힌다. 모바일 폭(430px) 안에 머문다.
 *
 * @param {{ open: boolean, onClose: () => void, title: React.ReactNode, children: React.ReactNode }} props
 */
export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="absolute inset-0 animate-fade-in bg-navy-900/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] animate-sheet-up">
        <div className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" aria-hidden />
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 id="sheet-title" className="text-lg leading-snug font-bold text-navy-700">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-xl text-slate-400 active:bg-slate-100"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
