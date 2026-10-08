/**
 * 기구 설명 (기구 등록 화면의 ⓘ). 초보자가 "어떤 기구인지" 알아볼 수 있도록 생김새를 쉬운 말로 적는다.
 * 사진은 라이선스를 확인한 것만 넣는다 (DECISIONS.md "기구 사진").
 *
 * @typedef {Object} EquipmentPhoto
 * @property {string} src         public/ 아래 경로 (예: '/equipment/hacksquat.jpg')
 * @property {string} author      작성자
 * @property {string} license     라이선스 이름 (예: 'CC BY-SA 4.0')
 * @property {string} licenseUrl
 * @property {string} sourceUrl   원본 페이지
 * @property {string} [modified]  고친 내용 (예: '크기 조정')
 *
 * @typedef {Object} EquipmentInfo
 * @property {string} look         생김새 한두 줄
 * @property {string} [searchQuery] 사진 검색어 (기본: 기구 이름 + " 헬스")
 * @property {EquipmentPhoto} [photo]
 */

/** @type {Record<string, EquipmentInfo>} */
export const EQUIPMENT_INFO = {
  // 프리웨이트·랙
  dumbbell: {
    look: '한 손에 하나씩 드는 짧은 아령과, 앉거나 누울 수 있는 벤치가 있는 구역이에요. 무게별로 거치대에 나란히 놓여 있어요.',
    searchQuery: '헬스장 덤벨 거치대',
  },
  barbell: {
    look: '길이 2m 정도의 긴 쇠막대(바)와 양 끝에 끼우는 원판이에요. 바닥이나 거치대에 따로 놓여 있어요.',
    searchQuery: '헬스장 바벨 원판',
  },
  bench: {
    look: '누울 수 있는 평평한 벤치 위쪽에 바벨을 걸어두는 거치대가 붙어 있어요.',
    searchQuery: '헬스장 벤치프레스 기구',
  },
  inclinebench: {
    look: '등받이를 비스듬히 세울 수 있는 벤치예요. 바벨 거치대가 붙어 있는 것도 있고, 벤치만 있는 것도 있어요.',
    searchQuery: '인클라인 벤치 헬스',
  },
  rack: {
    look: '사람 키보다 높은 철제 틀에 바벨을 걸어두는 고리와, 바를 떨어뜨려도 받쳐주는 안전바가 있어요. 파워랙이라고도 불러요.',
    searchQuery: '스쿼트랙 파워랙',
  },
  smith: {
    look: '바벨이 양옆 기둥의 레일에 고정돼 위아래로만 움직여요. 손목을 돌려 바를 걸고 풀 수 있어요.',
    searchQuery: '스미스 머신',
  },
  kettlebell: {
    look: '손잡이가 달린 둥근 쇳덩이예요. 대포알이나 주전자처럼 생겼어요.',
    searchQuery: '케틀벨',
  },

  // 상체 머신
  chestpress: {
    look: '의자에 앉아 등받이에 기댄 채, 가슴 앞의 손잡이를 앞으로 밀어내는 머신이에요.',
  },
  pecdeck: {
    look: '의자에 앉아 양옆으로 벌어진 손잡이(또는 팔 패드)를 가슴 앞으로 모으는 머신이에요. 반대로 앉으면 어깨 뒤쪽 운동도 돼요.',
    searchQuery: '펙덱 플라이 머신',
  },
  shoulderpress: {
    look: '의자에 앉아 어깨 옆의 손잡이를 머리 위로 밀어 올리는 머신이에요.',
  },
  latpull: {
    look: '의자에 앉아 허벅지를 패드로 고정하고, 머리 위의 긴 바를 가슴 쪽으로 당겨 내리는 머신이에요.',
    searchQuery: '랫풀다운 머신',
  },
  seatedrow: {
    look: '앉아서 발판에 발을 대고, 앞쪽의 손잡이(케이블)를 배 쪽으로 당기는 머신이에요.',
    searchQuery: '시티드 로우 머신',
  },
  tbar: {
    look: '발판 위에 서서 상체를 숙이고, 바닥에 한쪽 끝이 고정된 바의 손잡이를 당겨 올리는 기구예요.',
    searchQuery: 'T바 로우 머신',
  },
  preacher: {
    look: '앉아서 비스듬한 패드 위에 팔 뒤쪽을 올려놓고 바나 덤벨을 드는 벤치예요.',
    searchQuery: '프리처 컬 벤치',
  },

  // 하체 머신
  legpress: {
    look: '비스듬히 누운 의자에 앉아, 앞의 큰 발판을 다리로 밀어내는 머신이에요.',
    searchQuery: '레그프레스 머신',
  },
  legext: {
    look: '의자에 앉아 정강이 앞의 패드를 다리를 펴서 차올리는 머신이에요.',
    searchQuery: '레그 익스텐션 머신',
  },
  legcurl: {
    look: '엎드리거나 앉아서 발목 뒤의 패드를 엉덩이 쪽으로 당기는 머신이에요.',
    searchQuery: '레그 컬 머신',
  },
  hacksquat: {
    look: '어깨 패드 아래에 들어가 등을 비스듬한 판에 대고, 발판을 밀며 앉았다 일어나는 머신이에요.',
    searchQuery: '핵스쿼트 머신',
  },
  beltsquat: {
    look: '골반에 벨트를 차고 발판 위에 서서, 벨트에 걸린 무게로 앉았다 일어나는 머신이에요. 어깨에 무게가 실리지 않아요.',
    searchQuery: '벨트 스쿼트 머신',
  },
  hipthrust: {
    look: '등을 패드에 기대고 골반 위에 벨트나 패드를 걸어, 엉덩이를 들어 올리는 머신이에요.',
    searchQuery: '힙 쓰러스트 머신',
  },
  abductor: {
    look: '의자에 앉아 무릎 옆의 패드를 바깥으로 벌리거나(어브덕션) 안쪽으로 모으는(어덕션) 머신이에요. 패드 위치를 바꿔 둘 다 해요.',
    searchQuery: '어브덕션 어덕션 머신',
  },
  calfraise: {
    look: '어깨 패드 아래 서서(또는 앉아서) 발 앞쪽만 발판에 올리고 발뒤꿈치를 들어 올리는 머신이에요.',
    searchQuery: '카프 레이즈 머신',
  },

  // 케이블·맨몸 보조
  cable: {
    look: '높이를 바꿀 수 있는 도르래에 줄이 달린 큰 틀이에요. 손잡이를 바꿔 끼우며 여러 운동을 해요. 양쪽에 하나씩 있는 크로스오버형도 있어요.',
    searchQuery: '케이블 머신 크로스오버',
  },
  pullupbar: {
    look: '높은 곳에 매달릴 수 있는 가로 막대(풀업바)와, 양손으로 짚고 몸을 띄우는 평행한 손잡이(딥스대)예요. 둘이 붙어 있는 경우가 많아요.',
    searchQuery: '풀업 딥스 스테이션',
  },
  assist: {
    look: '무릎을 대는 패드(또는 발판)가 몸을 받쳐 올려줘서, 풀업과 딥스를 더 쉽게 할 수 있는 머신이에요.',
    searchQuery: '어시스트 풀업 머신',
  },
  romanchair: {
    look: '골반을 패드에 대고 발목을 고정한 채, 상체를 숙였다 펴는 기구예요. 45도로 기울어진 형태가 많아요.',
    searchQuery: '로만체어 백익스텐션',
  },
};

/** 사진 검색 주소 */
export function photoSearchUrl(equipment) {
  const query = EQUIPMENT_INFO[equipment.id]?.searchQuery ?? `${equipment.name} 헬스`;
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}
