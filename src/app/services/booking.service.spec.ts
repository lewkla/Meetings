import { describe, beforeEach, it, expect } from 'vitest';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    service = new BookingService();
    // Получаем доступ к приватному полю для очистки
    const bookings = (service as any).bookings;
    if (bookings) {
      (service as any).bookings = [];
    }
  });

  describe('addBooking', () => {
    it('should add booking to the list', () => {
      const initialCount = service.getBookings().length;

      service.addBooking({
        resourceId: 1,
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00'),
        title: 'Тестовая встреча'
      });

      const bookings = service.getBookings();

      expect(bookings.length).toBe(initialCount + 1);
      expect(bookings[bookings.length - 1].title).toBe('Тестовая встреча');
    });

    it('should generate unique id for each booking', () => {
      service.addBooking({
        resourceId: 1,
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00'),
        title: 'Первая'
      });

      service.addBooking({
        resourceId: 2,
        start: new Date('2024-01-01T12:00:00'),
        end: new Date('2024-01-01T13:00:00'),
        title: 'Вторая'
      });

      const bookings = service.getBookings();
      const ids = bookings.map(b => b.id);

      expect(new Set(ids).size).toBe(ids.length); // Все id уникальны
    });
  });

  describe('checkAvailability', () => {
    beforeEach(() => {
      // Добавляем тестовое бронирование
      service.addBooking({
        resourceId: 1,
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T12:00:00'),
        title: 'Существующая встреча'
      });
    });

    it('should return false for overlapping time on same resource', async () => {
      const result = await new Promise<boolean>(resolve => {
        service.checkAvailability(
          1,
          new Date('2024-01-01T11:00:00'), // Пересекается (11:00 внутри 10:00-12:00)
          new Date('2024-01-01T13:00:00')
        ).subscribe(resolve);
      });

      expect(result).toBe(false);
    });

    it('should return true for non-overlapping time', async () => {
      const result = await new Promise<boolean>(resolve => {
        service.checkAvailability(
          1,
          new Date('2024-01-01T14:00:00'), // После существующей
          new Date('2024-01-01T15:00:00')
        ).subscribe(resolve);
      });

      expect(result).toBe(true);
    });

    it('should return true for same time on different resource', async () => {
      const result = await new Promise<boolean>(resolve => {
        service.checkAvailability(
          2, // Другой ресурс
          new Date('2024-01-01T11:00:00'),
          new Date('2024-01-01T13:00:00')
        ).subscribe(resolve);
      });

      expect(result).toBe(true);
    });

    it('should allow bookings that end exactly when another starts', async () => {
      const result = await new Promise<boolean>(resolve => {
        service.checkAvailability(
          1,
          new Date('2024-01-01T08:00:00'),
          new Date('2024-01-01T10:00:00') // Конец в 10:00, начало существующей в 10:00 - ок
        ).subscribe(resolve);
      });

      expect(result).toBe(true);
    });

    it('should allow bookings that start exactly when another ends', async () => {
      const result = await new Promise<boolean>(resolve => {
        service.checkAvailability(
          1,
          new Date('2024-01-01T12:00:00'), // Начало в 12:00, конец существующей в 12:00 - ок
          new Date('2024-01-01T13:00:00')
        ).subscribe(resolve);
      });

      expect(result).toBe(true);
    });

    it('should return false when end time is before start time', async () => {
      const result = await new Promise<boolean>(resolve => {
        service.checkAvailability(
          1,
          new Date('2024-01-01T14:00:00'),
          new Date('2024-01-01T13:00:00') // Конец раньше начала!
        ).subscribe(resolve);
      });

      expect(result).toBe(false);
    });
  });

  describe('removeBooking', () => {
    it('should remove booking by id', () => {
      // Сначала добавляем бронирование
      service.addBooking({
        resourceId: 1,
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00'),
        title: 'Удаляемая встреча'
      });

      const bookingsBefore = service.getBookings();
      expect(bookingsBefore).toHaveLength(1);

      // Получаем ID добавленной встречи
      const bookingId = bookingsBefore[0].id;

      // Удаляем
      service.removeBooking(bookingId);

      const bookingsAfter = service.getBookings();
      expect(bookingsAfter).toHaveLength(0);
    });

    it('should not throw error when removing non-existent id', () => {
      service.addBooking({
        resourceId: 1,
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00'),
        title: 'Встреча'
      });

      expect(service.getBookings()).toHaveLength(1);

      // Пытаемся удалить несуществующий ID
      expect(() => service.removeBooking(999)).not.toThrow();

      expect(service.getBookings()).toHaveLength(1);
    });
  });

  describe('getBookings', () => {
    it('should return copy of bookings array', () => {
      service.addBooking({
        resourceId: 1,
        start: new Date('2024-01-01T10:00:00'),
        end: new Date('2024-01-01T11:00:00'),
        title: 'Встреча 1'
      });

      const bookings1 = service.getBookings();
      const bookings2 = service.getBookings();

      // Это должны быть разные массивы (копии)
      expect(bookings1).not.toBe(bookings2);
      expect(bookings1).toEqual(bookings2);
    });
  });
});
