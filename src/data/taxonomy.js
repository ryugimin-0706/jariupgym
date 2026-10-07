/**
 * 부위 탭(BODY_PARTS)은 보여주기용, 세부 타깃(TARGETS)은 대체 매칭 기준.
 * 화면 문구는 쉬운 말(label)을 쓴다. (DECISIONS.md)
 */

/** 화면 2-A 부위 탭, 홈 "주요 부위" */
export const BODY_PARTS = [
  { id: 'chest', name: '가슴' },
  { id: 'back', name: '등' },
  { id: 'legs', name: '하체' },
  { id: 'shoulders', name: '어깨' },
  { id: 'arms', name: '팔' },
];

/**
 * @typedef {Object} Target
 * @property {string} label    화면 표시용 쉬운 말
 * @property {string} bodyPart BODY_PARTS id
 */

/** @type {Record<string, Target>} */
export const TARGETS = {
  chest: { label: '가슴', bodyPart: 'chest' },
  back: { label: '등', bodyPart: 'back' },
  quads: { label: '허벅지 앞', bodyPart: 'legs' },
  hamstrings: { label: '허벅지 뒤·엉덩이', bodyPart: 'legs' },
  shoulders: { label: '어깨', bodyPart: 'shoulders' },
  biceps: { label: '팔 앞쪽', bodyPart: 'arms' },
  triceps: { label: '팔 뒤쪽', bodyPart: 'arms' },
};

/** 동작 패턴. 'isolation'은 추천 이유에서 동작 문구를 생략한다. */
export const PATTERNS = {
  horizontal_push: '수평 밀기',
  fly: '플라이',
  vertical_pull: '수직 당기기',
  horizontal_pull: '수평 당기기',
  squat: '스쿼트',
  lunge: '런지',
  hinge: '힌지',
  vertical_push: '수직 밀기',
  isolation: '고립',
};

export const ISOLATION = 'isolation';
