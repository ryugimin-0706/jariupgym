import { useCallback, useEffect, useRef, useState } from 'react';

const DURATION_MS = 2500;

/** 토스트 상태. show(message)로 띄우고 2.5초 뒤 사라진다. */
export function useToast() {
  const [toast, setToast] = useState(null); // { id, message }
  const timer = useRef(null);

  const show = useCallback((message) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show };
}

/** 화면 아래쪽에 뜨는 토스트 */
export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[430px] px-5">
        <p
          key={toast.id}
          role="status"
          className="animate-toast-in rounded-2xl bg-navy-900/95 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg"
        >
          {toast.message}
        </p>
      </div>
    </div>
  );
}
