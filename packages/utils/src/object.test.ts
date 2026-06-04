import { describe, it, expect } from 'vitest';

import { deepClone, pick, omit } from './object.js';

describe('Object Utilities', () => {
  describe('deepClone', () => {
    it('should create a deep copy of an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });

    it('should clone nested arrays', () => {
      const original = { list: [1, 2, 3] };
      const clone = deepClone(original);

      clone.list.push(4);
      expect(original.list).toHaveLength(3);
    });

    it('should handle primitive values inside objects', () => {
      const original = { name: 'Alice', age: 30 };
      const clone = deepClone(original);
      expect(clone).toEqual(original);
    });
  });

  describe('pick', () => {
    it('should return only the specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should return an empty object when keys list is empty', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, [])).toEqual({});
    });

    it('should not include keys that are not in the object', () => {
      const obj = { a: 1, b: 2 };
      const result = pick(obj, ['a'] as (keyof typeof obj)[]);
      expect(result).not.toHaveProperty('b');
    });
  });

  describe('omit', () => {
    it('should exclude the specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });

    it('should return the full object when keys list is empty', () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 });
    });

    it('should handle omitting multiple keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(omit(obj, ['a', 'c'])).toEqual({ b: 2, d: 4 });
    });
  });
});
