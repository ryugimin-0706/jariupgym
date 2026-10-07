/**
 * 받침에 따라 조사를 고른다. 한글이 아니면 받침 없음으로 본다.
 * josa('벤치프레스', '이', '가') → '벤치프레스가'
 * josa('레그 컬', '이', '가') → '레그 컬이'
 */
export function josa(word, withBatchim, withoutBatchim) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (hasBatchim ? withBatchim : withoutBatchim);
}
