/**
 * @typedef {Object} Equipment
 * @property {string} id
 * @property {string} name        기구 선택 화면, 운동 카드에 표시
 * @property {string} shortName   추천 이유 문구용 ("비어 있는 {shortName} 사용")
 * @property {string} emoji
 * @property {string} [desc]
 * @property {boolean} freeWeight 동점일 때 우선 추천 (DECISIONS.md)
 * @property {boolean} [alwaysAvailable] 맨몸: 항상 사용 가능, '사용 중' 불가
 * @property {boolean} [hidden]   기구 선택 화면에 표시하지 않음
 */

/** @type {Equipment[]} */
export const EQUIPMENT = [
  { id: 'bench', name: '벤치프레스', shortName: '벤치프레스', emoji: '🛋️', freeWeight: true },
  { id: 'rack', name: '스쿼트랙', shortName: '스쿼트랙', emoji: '🏗️', freeWeight: true },
  { id: 'smith', name: '스미스 머신', shortName: '스미스 머신', emoji: '🚪', freeWeight: false },
  { id: 'legpress', name: '레그프레스', shortName: '레그프레스', emoji: '🦵', freeWeight: false },
  { id: 'legext', name: '레그 익스텐션', shortName: '레그 익스텐션', emoji: '🦶', freeWeight: false },
  { id: 'legcurl', name: '레그 컬', shortName: '레그 컬', emoji: '🔄', freeWeight: false },
  { id: 'cable', name: '케이블 머신', shortName: '케이블', emoji: '🔗', freeWeight: false },
  { id: 'latpull', name: '랫풀다운', shortName: '랫풀다운', emoji: '⬇️', freeWeight: false },
  { id: 'seatedrow', name: '시티드 로우', shortName: '시티드 로우', emoji: '🚣', freeWeight: false },
  { id: 'chestpress', name: '체스트프레스 머신', shortName: '체스트프레스 머신', emoji: '💪', freeWeight: false },
  { id: 'pecdeck', name: '펙덱 플라이', shortName: '펙덱', emoji: '🦋', freeWeight: false },
  { id: 'shoulderpress', name: '숄더프레스 머신', shortName: '숄더프레스 머신', emoji: '🙌', freeWeight: false },
  { id: 'dumbbell', name: '덤벨 구역', shortName: '덤벨', desc: '덤벨 + 벤치', emoji: '🏋️', freeWeight: true },
  { id: 'barbell', name: '프리 바벨', shortName: '바벨', desc: '바벨 + 원판', emoji: '⚖️', freeWeight: true },
  { id: 'pullupbar', name: '풀업바 / 딥스대', shortName: '풀업바', emoji: '🧗', freeWeight: false },
  {
    id: 'bodyweight',
    name: '맨몸',
    shortName: '맨몸',
    emoji: '🤸',
    freeWeight: false,
    alwaysAvailable: true,
    hidden: true,
  },
];

export const BODYWEIGHT_ID = 'bodyweight';

/** @type {Record<string, Equipment>} */
export const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e]));

/** 기구 선택 화면에 보여줄 기구 (맨몸 제외) */
export const SELECTABLE_EQUIPMENT = EQUIPMENT.filter((e) => !e.hidden);
