/**
 * 하단 고정 버튼 영역. 한 손 조작을 위해 화면 아래에 붙는다.
 * 데스크톱에서도 모바일 폭(430px) 안에 머문다.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function BottomCTA({ children }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto w-full max-w-[430px] border-t border-slate-100 bg-white/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}
