import { describe, it, expect, vi, afterEach } from 'vitest';

import { formatDate, timeAgo, isToday } from './date.js';

describe('Date Utilities', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format a date as YYYY-MM-DD', () => {
      expect(formatDate(new Date(2024, 0, 5))).toBe('2024-01-05');
      expect(formatDate(new Date(2024, 11, 31))).toBe('2024-12-31');
    });

    it('should zero-pad single-digit month and day', () => {
      expect(formatDate(new Date(2024, 2, 7))).toBe('2024-03-07');
    });
  });

  describe('timeAgo', () => {
    it('should return "just now" for very recent dates', () => {
      const now = Date.now();
      expect(timeAgo(new Date(now - 30 * 1000))).toBe('just now');
    });

    it('should return minutes ago', () => {
      const now = Date.now();
      expect(timeAgo(new Date(now - 5 * 60 * 1000))).toBe('5 minutes ago');
    });

    it('should return hours ago', () => {
      const now = Date.now();
      expect(timeAgo(new Date(now - 3 * 60 * 60 * 1000))).toBe('3 hours ago');
    });

    it('should return days ago', () => {
      const now = Date.now();
      expect(timeAgo(new Date(now - 2 * 24 * 60 * 60 * 1000))).toBe(
        '2 days ago'
      );
    });

    it('should return months ago', () => {
      const now = Date.now();
      expect(timeAgo(new Date(now - 40 * 24 * 60 * 60 * 1000))).toBe(
        '1 months ago'
      );
    });

    it('should return years ago', () => {
      const now = Date.now();
      expect(timeAgo(new Date(now - 400 * 24 * 60 * 60 * 1000))).toBe(
        '1 years ago'
      );
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for a date in the past', () => {
      expect(isToday(new Date(2000, 0, 1))).toBe(false);
    });
  });
});
