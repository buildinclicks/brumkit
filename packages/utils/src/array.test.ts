import { describe, it, expect } from 'vitest';

import { unique, chunk, shuffle, groupBy } from './array.js';

describe('Array Utilities', () => {
  describe('unique', () => {
    it('should remove duplicate primitives', () => {
      expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    it('should return the same array when there are no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle an empty array', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('chunk', () => {
    it('should split an array into chunks of the given size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should return one chunk when size is larger than the array', () => {
      expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
    });

    it('should return an empty array for an empty input', () => {
      expect(chunk([], 3)).toEqual([]);
    });

    it('should handle chunk size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
  });

  describe('shuffle', () => {
    it('should return an array of the same length', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(shuffle(arr)).toHaveLength(arr.length);
    });

    it('should contain the same elements as the original', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(shuffle(arr).sort()).toEqual([...arr].sort());
    });

    it('should handle an empty array', () => {
      expect(shuffle([])).toEqual([]);
    });
  });

  describe('groupBy', () => {
    it('should group array elements by a key', () => {
      const items = [
        { type: 'fruit', name: 'apple' },
        { type: 'vegetable', name: 'carrot' },
        { type: 'fruit', name: 'banana' },
      ];
      const result = groupBy(items, 'type');
      expect(result['fruit']).toHaveLength(2);
      expect(result['vegetable']).toHaveLength(1);
    });

    it('should return an empty object for an empty array', () => {
      expect(groupBy([], 'type')).toEqual({});
    });

    it('should handle arrays with a single unique key', () => {
      const items = [
        { category: 'a', value: 1 },
        { category: 'a', value: 2 },
      ];
      const result = groupBy(items, 'category');
      expect(result['a']).toHaveLength(2);
    });
  });
});
