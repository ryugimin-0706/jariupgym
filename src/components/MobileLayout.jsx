/**
 * 모바일 폭(최대 430px) 가운데 정렬 레이아웃.
 * bottom을 넘기면 하단 고정 영역만큼 본문 아래 여백을 확보한다.
 *
 * @param {{ header?: React.ReactNode, bottom?: React.ReactNode, children: React.ReactNode }} props
 */
export default function MobileLayout({ header, bottom, children }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col bg-white shadow-sm">
      {header && <header className="sticky top-0 z-10 bg-white/95 px-5 pt-4 pb-3 backdrop-blur">{header}</header>}
      <main className={`flex-1 px-5 pb-6 ${bottom ? 'pb-32' : ''}`}>{children}</main>
      {bottom}
    </div>
  );
}
