import { isSameDay } from '../isSameDay';

describe('isSameDay', () => {
  describe('same day comparisons', () => {
    it('should return true for the same date object', () => {
      const date = new Date('2024-06-15T10:30:00Z');
      expect(isSameDay(date, date)).toBe(true);
    });

    it('should return true for different times on the same UTC day', () => {
      const morning = new Date('2024-06-15T08:00:00Z');
      const evening = new Date('2024-06-15T22:00:00Z');
      expect(isSameDay(morning, evening)).toBe(true);
    });

    it('should return true for same day at start and end of day', () => {
      const startOfDay = new Date('2024-06-15T00:00:00Z');
      const endOfDay = new Date('2024-06-15T23:59:59Z');
      expect(isSameDay(startOfDay, endOfDay)).toBe(true);
    });
  });

  describe('different day comparisons', () => {
    it('should return false for different days', () => {
      const today = new Date('2024-06-15T10:00:00Z');
      const yesterday = new Date('2024-06-14T10:00:00Z');
      expect(isSameDay(today, yesterday)).toBe(false);
    });

    it('should return false for different months', () => {
      const june = new Date('2024-06-15T10:00:00Z');
      const july = new Date('2024-07-15T10:00:00Z');
      expect(isSameDay(june, july)).toBe(false);
    });

    it('should return false for different years', () => {
      const year2024 = new Date('2024-06-15T10:00:00Z');
      const year2023 = new Date('2023-06-15T10:00:00Z');
      expect(isSameDay(year2024, year2023)).toBe(false);
    });

    it('should return false for dates at midnight boundary (different UTC days)', () => {
      const beforeMidnight = new Date('2024-06-15T23:59:59Z');
      const afterMidnight = new Date('2024-06-16T00:00:01Z');
      expect(isSameDay(beforeMidnight, afterMidnight)).toBe(false);
    });
  });

  describe('null/undefined handling', () => {
    it('should return false when second date is null', () => {
      const date = new Date('2024-06-15T10:00:00Z');
      expect(isSameDay(date, null)).toBe(false);
    });

    it('should return false when second date is undefined', () => {
      const date = new Date('2024-06-15T10:00:00Z');
      expect(isSameDay(date, undefined)).toBe(false);
    });
  });

  describe('UTC consistency', () => {
    it('should compare using UTC to avoid timezone issues', () => {
      // These dates are the same UTC day but could be different local days
      // depending on timezone
      const utcMorning = new Date('2024-06-15T02:00:00Z');
      const utcEvening = new Date('2024-06-15T20:00:00Z');
      expect(isSameDay(utcMorning, utcEvening)).toBe(true);
    });

    it('should handle dates created with different timezone offsets correctly', () => {
      // Both represent the same UTC moment
      const date1 = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));
      const date2 = new Date(Date.UTC(2024, 5, 15, 18, 0, 0));
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });
});
