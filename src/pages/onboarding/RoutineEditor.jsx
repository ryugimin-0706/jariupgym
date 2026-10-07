/** 화면 2-A. 내 루틴 입력 (설정의 "내 루틴 수정"에서도 재사용) */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import BottomCTA from '../../components/BottomCTA.jsx';
import BottomSheet from '../../components/BottomSheet.jsx';
import Button from '../../components/Button.jsx';
import MobileLayout from '../../components/MobileLayout.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Tag from '../../components/Tag.jsx';
import { EQUIPMENT_BY_ID } from '../../data/equipment.js';
import { EXERCISES_BY_ID } from '../../data/exercises.js';
import { DEFAULT_SETS } from '../../data/presetRoutines.js';
import { TARGETS } from '../../data/taxonomy.js';
import { useGym, useRoutine } from '../../hooks/useAppData.jsx';
import { isOwned } from '../../lib/recommend.js';
import {
  MAX_SETS,
  MIN_SETS,
  SPLIT_NAME_CHIPS,
  makeId,
  moveItem,
  splitNameFromChip,
  validateRoutineDraft,
} from '../../lib/routine.js';
import ExercisePicker from './ExercisePicker.jsx';

/**
 * @param {{ mode?: 'onboarding' | 'settings' }} props
 * 시작 값: 설정이면 저장된 루틴, 2-B "수정해서 쓰기"에서 왔으면 넘겨받은 분할, 아니면 빈 루틴
 */
export default function RoutineEditor({ mode = 'onboarding' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { routine, setRoutine } = useRoutine();
  const { equipmentIds, addEquipment } = useGym();

  const [splits, setSplits] = useState(
    () => (mode === 'settings' ? routine?.splits : location.state?.draft) ?? [],
  );
  const [addingSplit, setAddingSplit] = useState(false);
  const [pickerSplitId, setPickerSplitId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const pickerSplit = splits.find((s) => s.id === pickerSplitId) ?? null;
  const { ok, reason } = validateRoutineDraft(splits);

  // ── 분할 ──
  const updateSplit = (splitId, fn) => setSplits((prev) => prev.map((s) => (s.id === splitId ? fn(s) : s)));

  const addSplit = (name) => {
    const id = makeId('split');
    setSplits((prev) => [...prev, { id, name, exercises: [] }]);
    setAddingSplit(false);
    setPickerSplitId(id); // 만들자마자 운동 담기
  };

  const deleteSplit = (splitId) => {
    setSplits((prev) => prev.filter((s) => s.id !== splitId));
    setConfirmDeleteId(null);
  };

  // ── 운동 ──
  const addExercise = (splitId, exerciseId) =>
    updateSplit(splitId, (s) =>
      s.exercises.some((e) => e.exerciseId === exerciseId)
        ? s
        : { ...s, exercises: [...s.exercises, { id: makeId('e'), exerciseId, sets: DEFAULT_SETS }] },
    );

  const addCustom = (splitId, customName) =>
    updateSplit(splitId, (s) => ({
      ...s,
      exercises: [...s.exercises, { id: makeId('e'), exerciseId: null, customName, sets: DEFAULT_SETS }],
    }));

  const updateExercise = (splitId, exId, fn) =>
    updateSplit(splitId, (s) => ({ ...s, exercises: s.exercises.map((e) => (e.id === exId ? fn(e) : e)) }));

  const save = () => {
    setRoutine({
      source: 'custom',
      splits: splits.map((s) => ({ ...s, name: s.name.trim() })),
    });
    navigate('/', { replace: true });
  };

  return (
    <MobileLayout
      header={<PageHeader title={mode === 'settings' ? '내 루틴 수정' : '내 루틴 만들기'} />}
      bottom={
        <BottomCTA>
          {!ok && splits.length > 0 && <p className="text-center text-xs text-coral-700">{reason}</p>}
          <Button size="lg" full disabled={!ok} onClick={save}>
            {mode === 'settings' ? '저장' : '저장하고 시작하기'}
          </Button>
        </BottomCTA>
      }
    >
      <p className="mt-1 text-sm text-slate-500">운동하는 날(분할)을 만들고, 날마다 하는 운동을 담아주세요.</p>

      {splits.length === 0 && (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
          <p className="text-4xl" aria-hidden>
            🗓️
          </p>
          <p className="mt-3 font-semibold text-navy-700">아직 분할이 없어요</p>
          <p className="mt-1 text-sm text-slate-500">예: 가슴 하는날, 등 하는날, 하체 하는날</p>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {splits.map((split, splitIndex) => (
          <section key={split.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1">
              <label className="sr-only" htmlFor={`name-${split.id}`}>
                분할 이름
              </label>
              <input
                id={`name-${split.id}`}
                value={split.name}
                onChange={(e) => updateSplit(split.id, (s) => ({ ...s, name: e.target.value }))}
                maxLength={20}
                placeholder="분할 이름"
                className="min-h-11 min-w-0 flex-1 rounded-lg px-1 text-lg font-bold text-navy-900 outline-none focus:bg-slate-50"
              />
              <IconButton label="분할 위로" disabled={splitIndex === 0} onClick={() => setSplits((p) => moveItem(p, splitIndex, -1))}>
                ↑
              </IconButton>
              <IconButton
                label="분할 아래로"
                disabled={splitIndex === splits.length - 1}
                onClick={() => setSplits((p) => moveItem(p, splitIndex, 1))}
              >
                ↓
              </IconButton>
              <IconButton
                label="분할 삭제"
                onClick={() => (split.exercises.length ? setConfirmDeleteId(split.id) : deleteSplit(split.id))}
              >
                🗑
              </IconButton>
            </div>

            {split.exercises.length === 0 ? (
              <p className="mt-2 rounded-xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-400">담은 운동이 없어요</p>
            ) : (
              <ol className="mt-2 divide-y divide-slate-50">
                {split.exercises.map((item, i) => {
                  const exercise = item.exerciseId ? EXERCISES_BY_ID[item.exerciseId] : null;
                  const eq = exercise ? EQUIPMENT_BY_ID[exercise.equipmentId] : null;
                  const has = exercise ? isOwned(exercise.equipmentId, equipmentIds) : true;
                  return (
                    <li key={item.id} className="py-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 w-5 shrink-0 text-sm font-semibold text-slate-300">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-navy-900">{exercise?.name ?? item.customName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {exercise ? `${eq.emoji} ${eq.name} · ${TARGETS[exercise.target].label}` : '직접 입력한 운동'}
                          </p>
                          {(!exercise || !has) && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              {!exercise && <Tag>대체 추천 미지원</Tag>}
                              {exercise && !has && (
                                <>
                                  <Tag tone="coral">기구 없음</Tag>
                                  <button
                                    type="button"
                                    onClick={() => addEquipment(eq.id)}
                                    className="-my-2 min-h-11 px-1.5 text-xs font-semibold text-mint-700 active:underline"
                                  >
                                    ＋ 기구 추가
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <IconButton
                          label={`${exercise?.name ?? item.customName} 삭제`}
                          onClick={() =>
                            updateSplit(split.id, (s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== item.id) }))
                          }
                        >
                          ✕
                        </IconButton>
                      </div>
                      <div className="mt-1 flex items-center justify-between pl-7">
                        <div className="flex items-center rounded-full bg-slate-50">
                          <IconButton
                            label="세트 줄이기"
                            disabled={item.sets <= MIN_SETS}
                            onClick={() => updateExercise(split.id, item.id, (e) => ({ ...e, sets: e.sets - 1 }))}
                          >
                            −
                          </IconButton>
                          <span className="w-12 text-center text-sm font-semibold text-navy-700">{item.sets}세트</span>
                          <IconButton
                            label="세트 늘리기"
                            disabled={item.sets >= MAX_SETS}
                            onClick={() => updateExercise(split.id, item.id, (e) => ({ ...e, sets: e.sets + 1 }))}
                          >
                            +
                          </IconButton>
                        </div>
                        <div className="flex">
                          <IconButton
                            label="운동 위로"
                            disabled={i === 0}
                            onClick={() => updateSplit(split.id, (s) => ({ ...s, exercises: moveItem(s.exercises, i, -1) }))}
                          >
                            ↑
                          </IconButton>
                          <IconButton
                            label="운동 아래로"
                            disabled={i === split.exercises.length - 1}
                            onClick={() => updateSplit(split.id, (s) => ({ ...s, exercises: moveItem(s.exercises, i, 1) }))}
                          >
                            ↓
                          </IconButton>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <Button variant="outline" full className="mt-2" onClick={() => setPickerSplitId(split.id)}>
              ＋ 운동 담기
            </Button>
          </section>
        ))}
      </div>

      <Button variant="mint" size="lg" full className="mt-4" onClick={() => setAddingSplit(true)}>
        ＋ 분할 추가
      </Button>

      <AddSplitSheet open={addingSplit} onClose={() => setAddingSplit(false)} onAdd={addSplit} />

      <ExercisePicker
        split={pickerSplit}
        onClose={() => setPickerSplitId(null)}
        onAdd={(exerciseId) => addExercise(pickerSplitId, exerciseId)}
        onAddCustom={(name) => addCustom(pickerSplitId, name)}
        onRemove={(itemId) =>
          updateSplit(pickerSplitId, (s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== itemId) }))
        }
      />

      <BottomSheet open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="분할을 삭제할까요?">
        <p className="-mt-2 mb-5 text-sm text-slate-500">
          <b className="text-navy-700">{splits.find((s) => s.id === confirmDeleteId)?.name}</b>에 담은 운동도 함께
          지워져요.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="coral" size="lg" full onClick={() => deleteSplit(confirmDeleteId)}>
            삭제
          </Button>
          <Button variant="ghost" full onClick={() => setConfirmDeleteId(null)}>
            취소
          </Button>
        </div>
      </BottomSheet>
    </MobileLayout>
  );
}

function IconButton({ label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-lg text-slate-500 active:bg-slate-100 disabled:opacity-25"
      {...props}
    >
      {children}
    </button>
  );
}

/** 분할 추가: 이름 입력 + 빠른 입력 칩 */
function AddSplitSheet({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  const close = () => {
    setName('');
    onClose();
  };
  const submit = (e) => {
    e.preventDefault();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <BottomSheet open={open} onClose={close} title="분할 추가">
      <form onSubmit={submit}>
        <label htmlFor="split-name" className="text-sm font-semibold text-navy-700">
          운동하는 날 이름
        </label>
        <input
          id="split-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="예: 가슴 하는날"
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-mint-500"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {SPLIT_NAME_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setName(splitNameFromChip(chip))}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ring-1 transition ${
                name === splitNameFromChip(chip)
                  ? 'bg-mint-50 text-mint-700 ring-mint-500'
                  : 'bg-white text-slate-600 ring-slate-200 active:bg-slate-50'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" full className="mt-5" disabled={!trimmed}>
          추가하고 운동 담기
        </Button>
      </form>
    </BottomSheet>
  );
}
