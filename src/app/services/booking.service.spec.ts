import { describe, beforeEach, it, expect } from 'vitest';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    service = new BookingService();
  });

  it('должен создаваться', () => {
    expect(service).toBeTruthy();
  });

  it('должен добавлять бронирование', () => {
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

  it('должен определять пересечение времени', async () => {
    service.addBooking({
      resourceId: 1,
      start: new Date('2024-01-01T10:00:00'),
      end: new Date('2024-01-01T12:00:00'),
      title: 'Первая встреча'
    });

    const isAvailable = await new Promise<boolean>(resolve => {
      service.checkAvailability(
        1,
        new Date('2024-01-01T11:00:00'),
        new Date('2024-01-01T13:00:00')
      ).subscribe(resolve);
    });

    expect(isAvailable).toBe(false);
  });

  it('должен разрешать непересекающиеся бронирования', async () => {
    service.addBooking({
      resourceId: 1,
      start: new Date('2024-01-01T10:00:00'),
      end: new Date('2024-01-01T12:00:00'),
      title: 'Первая встреча'
    });

    const isAvailable = await new Promise<boolean>(resolve => {
      service.checkAvailability(
        1,
        new Date('2024-01-01T14:00:00'),
        new Date('2024-01-01T15:00:00')
      ).subscribe(resolve);
    });

    expect(isAvailable).toBe(true);
  });

  it('должен разрешать бронирования для разных ресурсов', async () => {
    service.addBooking({
      resourceId: 1,
      start: new Date('2024-01-01T10:00:00'),
      end: new Date('2024-01-01T12:00:00'),
      title: 'Встреча в комнате 1'
    });

    const isAvailable = await new Promise<boolean>(resolve => {
      service.checkAvailability(
        2,
        new Date('2024-01-01T11:00:00'),
        new Date('2024-01-01T13:00:00')
      ).subscribe(resolve);
    });

    expect(isAvailable).toBe(true);
  });

  it('должен удалять бронирование по id', () => {
    const booking = service.addBooking({
      resourceId: 1,
      start: new Date('2024-01-01T10:00:00'),
      end: new Date('2024-01-01T11:00:00'),
      title: 'Удаляемая встреча'
    });

    expect(service.getBookings()).toContain(booking);

    service.removeBooking(booking.id);

    expect(service.getBookings()).not.toContain(booking);
  });
});
