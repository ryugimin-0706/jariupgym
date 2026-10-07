/** 화면 1. 내 헬스장 기구 등록 (설정의 "내 헬스장 기구 수정"에서도 재사용) */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import BottomCTA from '../../components/BottomCTA.jsx';
import Button from '../../components/Button.jsx';
import MobileLayout from '../../components/MobileLayout.jsx';
import { SELECTABLE_EQUIPMENT } from '../../data/equipment.js';
import { useGym } from '../../hooks/useAppData.jsx';

const ALL_IDS = SELECTABLE_EQUIPMENT.map((e) => e.id);

/**
 * @param {{ mode?: 'onboarding' | 'settings', next: string }} props
 *   next: 저장 후 이동할 경로
 */
export default function EquipmentSelect({ mode = 'onboarding', next }) {
  const navigate = useNavigate();
  const { equipmentIds, setGym } = useGym();
  // 맨몸 등 선택 화면에 없는 id는 걸러서 시작
  const [selected, setSelected] = useState(() => new Set(equipmentIds.filter((id) => ALL_IDS.includes(id))));

  const allSelected = selected.size === ALL_IDS.length;

  const toggle = (id) =>
    setSelected((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      return nextSet;
    });

  const save = () => {
    // 데이터 순서대로 저장
    setGym(ALL_IDS.filter((id) => selected.has(id)));
    // 설정에서 저장하면 기구 화면이 기록에 남지 않게 (뒤로가기 시 다시 안 나오도록)
    navigate(next, { replace: mode === 'settings' });
  };

  return (
    <MobileLayout
      header={
        mode === 'settings' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="-ml-2 flex size-11 items-center justify-center rounded-full text-2xl text-navy-700 active:bg-slate-100"
              aria-label="뒤로"
            >
              ‹
            </button>
            <h1 className="text-xl font-bold text-navy-700">내 헬스장 기구</h1>
          </div>
        ) : (
          <p className="text-sm font-semibold text-mint-600">1 / 2</p>
        )
      }
      bottom={
        <BottomCTA>
          <Button size="lg" full disabled={selected.size === 0} onClick={save}>
            {selected.size === 0 ? '기구를 1개 이상 골라주세요' : mode === 'settings' ? '저장' : '다음'}
          </Button>
        </BottomCTA>
      }
    >
      {mode === 'onboarding' && (
        <h1 className="mt-2 text-2xl leading-snug font-bold text-navy-700">
          다니는 헬스장의
          <br />
          기구를 알려주세요
        </h1>
      )}
      <p className="mt-2 text-sm text-slate-500">맨몸 운동은 기구 없이 언제든 할 수 있어요.</p>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-navy-700">
          <span className="text-mint-600">{selected.size}</span> / {ALL_IDS.length}개 선택
        </p>
        <Button
          variant={allSelected ? 'ghost' : 'outline'}
          onClick={() => setSelected(allSelected ? new Set() : new Set(ALL_IDS))}
        >
          {allSelected ? '전체 해제' : '대부분 있어요'}
        </Button>
      </div>
      {!allSelected && selected.size === 0 && (
        <p className="mb-3 rounded-xl bg-navy-50 px-3 py-2 text-xs text-navy-700">
          💡 &ldquo;대부분 있어요&rdquo;를 누르고 없는 기구만 빼면 빨라요
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3">
        {SELECTABLE_EQUIPMENT.map((eq) => {
          const on = selected.has(eq.id);
          return (
            <li key={eq.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(eq.id)}
                className={`relative flex h-full min-h-24 w-full flex-col items-start justify-between rounded-2xl border-2 p-3.5 text-left transition active:scale-[0.98] ${
                  on ? 'border-mint-500 bg-mint-50' : 'border-slate-100 bg-white'
                }`}
              >
                <span className={`text-3xl transition ${on ? '' : 'opacity-50 grayscale'}`} aria-hidden>
                  {eq.emoji}
                </span>
                <span className="mt-2">
                  <span className={`block text-sm leading-tight font-bold ${on ? 'text-navy-900' : 'text-slate-500'}`}>
                    {eq.name}
                  </span>
                  {eq.desc && <span className="mt-0.5 block text-xs text-slate-400">{eq.desc}</span>}
                </span>
                <span
                  className={`absolute top-3 right-3 flex size-6 items-center justify-center rounded-full text-xs font-bold transition ${
                    on ? 'bg-mint-500 text-white' : 'border-2 border-slate-200 text-transparent'
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </MobileLayout>
  );
}
