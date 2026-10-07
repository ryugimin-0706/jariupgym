/** 화면 2-A의 "운동 담기" 바텀시트: 부위 탭 → 운동 목록, 직접 입력 */
import { useState } from 'react';
import BottomSheet from '../../components/BottomSheet.jsx';
import Button from '../../components/Button.jsx';
import Tag from '../../components/Tag.jsx';
import { EQUIPMENT_BY_ID } from '../../data/equipment.js';
import { EXERCISES } from '../../data/exercises.js';
import { BODY_PARTS, TARGETS } from '../../data/taxonomy.js';
import { useGym } from '../../hooks/useAppData.jsx';
import { isOwned } from '../../lib/recommend.js';
import { guessBodyPart } from '../../lib/routine.js';

/**
 * @param {{
 *   split: import('../../lib/storage.js').Split | null,
 *   onClose: () => void,
 *   onAdd: (exerciseId: string) => void,
 *   onAddCustom: (name: string) => void,
 *   onRemove: (itemId: string) => void,  담은 운동 항목 삭제 (직접 입력 목록의 ✕)
 * }} props
 */
export default function ExercisePicker({ split, onClose, onAdd, onAddCustom, onRemove }) {
  return (
    <BottomSheet
      open={!!split}
      onClose={onClose}
      title={split ? `${split.name.trim() || '분할'}에 운동 담기` : ''}
    >
      {/* 시트를 열 때마다 탭·입력 상태를 새로 시작 */}
      {split && (
        <PickerBody
          key={split.id}
          split={split}
          onAdd={onAdd}
          onAddCustom={onAddCustom}
          onRemove={onRemove}
          onDone={onClose}
        />
      )}
    </BottomSheet>
  );
}

function PickerBody({ split, onAdd, onAddCustom, onRemove, onDone }) {
  const { equipmentIds, addEquipment } = useGym();
  const [tab, setTab] = useState(() => guessBodyPart(split.name));
  const [customName, setCustomName] = useState('');

  /** 운동 id → 담은 항목 id (다시 누르면 빼기 위해) */
  const inSplit = new Map(split.exercises.filter((e) => e.exerciseId).map((e) => [e.exerciseId, e.id]));
  const customItems = split.exercises.filter((e) => !e.exerciseId);
  const customNames = new Set(customItems.map((e) => e.customName));
  const addedCount = split.exercises.length;

  // 부위 탭의 운동: 내 기구로 할 수 있는 운동 먼저, 기구 없는 운동은 아래에 흐리게 (각각 데이터 순서)
  const list = EXERCISES.filter((e) => TARGETS[e.target].bodyPart === tab);
  const owned = list.filter((e) => isOwned(e.equipmentId, equipmentIds));
  const notOwned = list.filter((e) => !isOwned(e.equipmentId, equipmentIds));

  const trimmed = customName.trim();
  const customDuplicate = customNames.has(trimmed);
  const submitCustom = (e) => {
    e.preventDefault();
    if (!trimmed || customDuplicate) return;
    onAddCustom(trimmed);
    setCustomName('');
  };

  return (
    <>
      <div role="tablist" className="sticky -top-3 z-10 -mx-5 mb-2 flex gap-1.5 overflow-x-auto bg-white px-5 py-2">
        {BODY_PARTS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={tab === b.id}
            onClick={() => setTab(b.id)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
              tab === b.id ? 'bg-navy-700 text-white' : 'bg-slate-100 text-slate-500 active:bg-slate-200'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>
      {inSplit.size > 0 && (
        <p className="-mt-1 mb-1 text-xs text-slate-400">✓ 담음을 한 번 더 누르면 빠져요</p>
      )}

      <ul className="divide-y divide-slate-50">
        {[...owned, ...notOwned].map((exercise) => {
          const eq = EQUIPMENT_BY_ID[exercise.equipmentId];
          const has = isOwned(exercise.equipmentId, equipmentIds);
          const addedItemId = inSplit.get(exercise.id);
          return (
            <li key={exercise.id} className="flex items-center gap-3 py-2.5">
              <span className={`min-w-0 flex-1 ${has ? '' : 'opacity-60'}`}>
                <span className="block font-semibold text-navy-900">{exercise.name}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span>
                    {eq.emoji} {eq.name} · {TARGETS[exercise.target].label}
                  </span>
                </span>
                {!has && (
                  <span className="mt-1 flex items-center gap-1">
                    <Tag tone="coral">기구 없음</Tag>
                    <button
                      type="button"
                      onClick={() => addEquipment(eq.id)}
                      className="-my-2 min-h-11 px-1.5 text-xs font-semibold text-mint-700 active:underline"
                    >
                      ＋ 기구 추가
                    </button>
                  </span>
                )}
              </span>
              {addedItemId ? (
                <button
                  type="button"
                  aria-pressed="true"
                  aria-label={`${exercise.name} 빼기`}
                  onClick={() => onRemove(addedItemId)}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-2xl bg-mint-500 px-4 text-sm font-semibold text-white active:bg-mint-600"
                >
                  ✓ 담음
                </button>
              ) : (
                <Button variant="outline" className="shrink-0" onClick={() => onAdd(exercise.id)}>
                  ＋ 담기
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={submitCustom} className="mt-4 rounded-2xl bg-slate-50 p-4">
        <label htmlFor="custom-exercise" className="text-sm font-semibold text-navy-700">
          목록에 없는 운동 직접 입력
        </label>
        <p className="mt-0.5 text-xs text-slate-500">직접 입력한 운동은 자리가 없을 때 대체 운동을 추천해 드릴 수 없어요.</p>
        {customItems.length > 0 && (
          <ul className="mt-3 space-y-1.5" aria-label="직접 입력해서 담은 운동">
            {customItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-xl bg-white py-1 pr-1 pl-3 ring-1 ring-mint-100">
                <span className="min-w-0 flex-1 truncate font-semibold text-navy-900">{item.customName}</span>
                <span className="shrink-0 text-sm font-semibold text-mint-600">추가됨 ✓</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`${item.customName} 빼기`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex gap-2">
          <input
            id="custom-exercise"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            maxLength={30}
            placeholder="예: 랜드마인 프레스"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-mint-500"
          />
          <Button type="submit" variant="outline" disabled={!trimmed || customDuplicate}>
            추가
          </Button>
        </div>
        {customDuplicate && <p className="mt-1 text-xs text-coral-700">이미 담은 운동이에요</p>}
      </form>

      <div className="sticky -bottom-5 -mx-5 mt-4 bg-white px-5 pt-2 pb-1">
        <Button size="lg" full onClick={onDone}>
          완료 {addedCount > 0 && <span className="font-normal opacity-80">· {addedCount}개 담음</span>}
        </Button>
      </div>
    </>
  );
}
