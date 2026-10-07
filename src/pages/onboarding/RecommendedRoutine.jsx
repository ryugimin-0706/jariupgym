/** 화면 2-B. 내 헬스장 맞춤 추천 루틴 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import BottomCTA from '../../components/BottomCTA.jsx';
import Button from '../../components/Button.jsx';
import { GuideButton, GuideSheet } from '../../components/ExerciseGuide.jsx';
import MobileLayout from '../../components/MobileLayout.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Tag from '../../components/Tag.jsx';
import { EQUIPMENT_BY_ID } from '../../data/equipment.js';
import { EXERCISES_BY_ID } from '../../data/exercises.js';
import { TARGETS } from '../../data/taxonomy.js';
import { useGym, useRoutine } from '../../hooks/useAppData.jsx';
import { adaptPresetRoutines, makeId, summarizeSplit } from '../../lib/routine.js';

/**
 * 맞춤 변환 결과를 저장용 루틴으로 바꾼다.
 * 운동이 하나도 없는 분할은 시작할 수 없으므로 뺀다. "내 헬스장 맞춤" 표시(adaptedFrom)는 저장하지 않는다.
 * @param {import('../../lib/routine.js').AdaptedSplit[]} splits
 */
function toRoutineSplits(splits) {
  return splits
    .filter((s) => s.exercises.length > 0)
    .map((s) => ({
      id: makeId('split'),
      name: s.name,
      exercises: s.exercises.map(({ id, exerciseId, sets }) => ({ id, exerciseId, sets })),
    }));
}

export default function RecommendedRoutine() {
  const navigate = useNavigate();
  const { equipmentIds } = useGym();
  const { setRoutine } = useRoutine();
  const splits = useMemo(() => adaptPresetRoutines(equipmentIds), [equipmentIds]);

  // 바뀐 운동이 있는 분할은 펼쳐서 보여준다. 없으면 첫 분할만.
  const [guideId, setGuideId] = useState(null);
  const [open, setOpen] = useState(() => {
    const adapted = splits.filter((s) => s.exercises.some((e) => e.adaptedFrom)).map((s) => s.id);
    return new Set(adapted.length ? adapted : [splits[0]?.id]);
  });
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const adaptedCount = splits.reduce((n, s) => n + s.exercises.filter((e) => e.adaptedFrom).length, 0);
  const routineSplits = toRoutineSplits(splits);

  const startAsIs = () => {
    setRoutine({ source: 'recommended', splits: routineSplits });
    navigate('/', { replace: true });
  };

  return (
    <MobileLayout
      header={<PageHeader step="2 / 2" />}
      bottom={
        <BottomCTA>
          {/* 왼쪽 보조(수정하기), 오른쪽 주 버튼 — 기구 선택 화면과 같은 배치 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="basis-1/3"
              disabled={routineSplits.length === 0}
              onClick={() => navigate('/onboarding/custom', { state: { draft: routineSplits } })}
            >
              수정하기
            </Button>
            <Button size="lg" className="basis-2/3" disabled={routineSplits.length === 0} onClick={startAsIs}>
              이대로 시작하기
            </Button>
          </div>
        </BottomCTA>
      }
    >
      <h1 className="mt-2 text-2xl leading-snug font-bold text-navy-700">
        내 헬스장 기구로 짠
        <br />
        추천 루틴이에요
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {adaptedCount > 0 ? (
          <>
            내 헬스장에 없는 기구를 쓰는 운동 <b className="text-mint-700">{adaptedCount}개</b>를 같은 부위 운동으로
            바꿔 넣었어요.
          </>
        ) : (
          '내 헬스장 기구로 모든 운동을 할 수 있어요.'
        )}
      </p>

      <ul className="mt-6 space-y-3">
        {splits.map((split) => {
          const isOpen = open.has(split.id);
          const { count, bodyParts } = summarizeSplit(split);
          const adapted = split.exercises.filter((e) => e.adaptedFrom).length;
          return (
            <li key={split.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(split.id)}
                className="flex min-h-16 w-full items-center gap-3 px-5 py-4 text-left active:bg-slate-50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-navy-900">{split.name}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-sm text-slate-500">운동 {count}개</span>
                    {bodyParts.slice(0, 3).map((part) => (
                      <Tag key={part} tone="navy">
                        {part}
                      </Tag>
                    ))}
                    {adapted > 0 && <Tag tone="mint">맞춤 {adapted}개</Tag>}
                  </span>
                </span>
                <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden>
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 pt-2 pb-4">
                  {split.exercises.length > 0 && (
                    <ol className="divide-y divide-slate-50">
                      {split.exercises.map((e, i) => {
                        const exercise = EXERCISES_BY_ID[e.exerciseId];
                        const eq = EQUIPMENT_BY_ID[exercise.equipmentId];
                        return (
                          <li key={e.id} className="flex items-start gap-3 py-3">
                            <span className="mt-0.5 w-5 shrink-0 text-sm font-semibold text-slate-300">{i + 1}</span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-navy-900">{exercise.name}</span>
                                <GuideButton exerciseId={exercise.id} onOpen={setGuideId} className="-mx-2" />
                                {e.adaptedFrom && <Tag tone="mint">내 헬스장 맞춤</Tag>}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-500">
                                {eq.emoji} {eq.name} · {TARGETS[exercise.target].label} · {e.sets}세트
                              </span>
                              {e.adaptedFrom && (
                                <span className="mt-0.5 block text-xs text-slate-400">
                                  <span className="line-through">{EXERCISES_BY_ID[e.adaptedFrom].name}</span> 대신
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {split.droppedExerciseIds.length > 0 && (
                    <p className="mt-2 text-xs text-slate-400">
                      내 헬스장 기구로 대신할 운동이 없어 뺐어요:{' '}
                      {split.droppedExerciseIds.map((id) => EXERCISES_BY_ID[id].name).join(', ')}
                    </p>
                  )}

                  {split.exercises.length === 0 ? (
                    <p className="mt-2 rounded-xl bg-coral-50 px-3 py-2 text-xs text-coral-700">
                      이 분할은 내 헬스장 기구로 할 수 있는 운동이 없어서 루틴에서 빼요.
                    </p>
                  ) : (
                    split.tooFew && (
                      <p className="mt-2 rounded-xl bg-coral-50 px-3 py-2 text-xs text-coral-700">
                        운동이 {split.exercises.length}개뿐이에요. &ldquo;수정하기&rdquo;로 운동을 더 담아보세요.
                      </p>
                    )
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <GuideSheet exerciseId={guideId} onClose={() => setGuideId(null)} />
    </MobileLayout>
  );
}
