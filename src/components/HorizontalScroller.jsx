import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 가로 스크롤 영역.
 * - 넘길 내용이 남은 쪽 가장자리를 흐리게 표시해 스크롤할 수 있다는 걸 알려준다.
 * - PC에서는 마우스 세로 휠을 가로 스크롤로 바꿔준다. (휴대폰은 터치로 넘김)
 * 부모의 좌우 여백(px-5)까지 꽉 채워 스크롤되도록 -mx-5 px-5를 쓴다.
 */
export default function HorizontalScroller({ children, className = '' }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    update();

    // 세로 휠 → 가로 스크롤 (넘칠 때만, 끝에 닿으면 페이지 스크롤에 양보)
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft >= max - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      update();
    };

    const resize = new ResizeObserver(update);
    resize.observe(el);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      resize.disconnect();
      el.removeEventListener('wheel', onWheel);
    };
  }, [update]);

  // 칩이 추가·삭제되면 가장자리 표시를 다시 계산
  useEffect(update, [children, update]);

  const fade = 'pointer-events-none absolute inset-y-0 w-10 transition-opacity duration-200';
  return (
    <div className={`relative -mx-5 ${className}`}>
      <div ref={ref} onScroll={update} className="no-scrollbar flex gap-2 overflow-x-auto px-5">
        {children}
      </div>
      <div className={`${fade} left-0 bg-linear-to-r from-white ${edges.left ? 'opacity-100' : 'opacity-0'}`} aria-hidden />
      <div className={`${fade} right-0 bg-linear-to-l from-white ${edges.right ? 'opacity-100' : 'opacity-0'}`} aria-hidden />
    </div>
  );
}
