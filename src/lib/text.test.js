import { describe, expect, it } from 'vitest';
import { josa } from './text.js';

describe('josa', () => {
  it('받침 유무에 따라 조사를 고른다', () => {
    expect(josa('벤치프레스', '이', '가')).toBe('벤치프레스가');
    expect(josa('레그 컬', '이', '가')).toBe('레그 컬이');
    expect(josa('스쿼트랙', '은', '는')).toBe('스쿼트랙은');
    expect(josa('풀업바 / 딥스대', '이', '가')).toBe('풀업바 / 딥스대가');
  });
});
