/** 기구 설명 시트 (기구 등록 화면의 ⓘ): 사진(있으면) + 생김새 + 이 기구로 하는 운동 + 사진 검색 */
import { EQUIPMENT_BY_ID } from '../data/equipment.js';
import { EQUIPMENT_INFO, photoSearchUrl } from '../data/equipmentInfo.js';
import { EXERCISES } from '../data/exercises.js';
import BottomSheet from './BottomSheet.jsx';
import Button from './Button.jsx';

/**
 * @param {{
 *   equipmentId: string | null,
 *   selected: boolean,
 *   onToggle: () => void,
 *   onClose: () => void,
 *   onGuide: (exerciseId: string) => void,  운동 이름을 누르면 운동 방법
 * }} props
 */
export default function EquipmentInfoSheet({ equipmentId, selected, onToggle, onClose, onGuide }) {
  const eq = equipmentId ? EQUIPMENT_BY_ID[equipmentId] : null;
  const info = equipmentId ? EQUIPMENT_INFO[equipmentId] : null;
  if (!eq || !info) return <BottomSheet open={false} onClose={onClose} title="" />;

  const exercises = EXERCISES.filter((e) => e.equipmentId === eq.id);
  const { photo } = info;

  return (
    <BottomSheet open onClose={onClose} title={eq.name}>
      {photo ? (
        <figure className="-mt-2 mb-4">
          <img
            src={photo.src}
            alt={`${eq.name} 사진`}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl bg-slate-100 object-cover"
          />
          <figcaption className="mt-1.5 text-[11px] leading-snug text-slate-400">
            사진:{' '}
            <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {photo.author}
            </a>{' '}
            ·{' '}
            <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {photo.license}
            </a>
            {photo.modified && ` · ${photo.modified}`}
          </figcaption>
        </figure>
      ) : (
        <div className="-mt-2 mb-4 flex h-24 items-center justify-center rounded-2xl bg-slate-50 text-5xl" aria-hidden>
          {eq.emoji}
        </div>
      )}

      {(eq.hint || eq.desc) && <p className="text-sm font-semibold text-mint-700">{eq.hint ?? eq.desc}</p>}
      <p className="mt-1 text-[15px] leading-relaxed text-navy-900">{info.look}</p>

      <a
        href={photoSearchUrl(eq)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-navy-700 ring-1 ring-slate-200 active:bg-slate-50"
      >
        📷 사진 검색으로 보기 <span className="text-xs font-normal text-slate-400">Google 이미지</span>
      </a>

      {exercises.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-500">이 기구로 하는 운동</h3>
          <ul className="flex flex-wrap gap-2">
            {exercises.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => onGuide(ex.id)}
                  className="min-h-11 rounded-full bg-navy-50 px-3.5 text-sm text-navy-700 active:bg-navy-100"
                >
                  {ex.name} <span className="text-slate-400">ⓘ</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Button
        variant={selected ? 'outline' : 'primary'}
        size="lg"
        full
        className="mt-6"
        onClick={() => {
          onToggle();
          onClose();
        }}
      >
        {selected ? '선택 해제' : '✓ 우리 헬스장에 있어요'}
      </Button>
    </BottomSheet>
  );
}
