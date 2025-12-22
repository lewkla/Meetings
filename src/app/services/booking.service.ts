import { Injectable } from '@angular/core';
import { Booking } from '../models/booking.model';
import { Observable, of, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private bookings: Booking[] = [];
  private lastId = 0;
  private bookingsChanged = new Subject<void>(); // Добавляем Subject

  constructor() {
  }

  getBookingsChanged() {
    return this.bookingsChanged.asObservable();
  }

  addBooking(booking: Omit<Booking, 'id'>) {
    const newBooking: Booking = {
      ...booking,
      id: ++this.lastId
    };
    this.bookings.push(newBooking);
    this.bookingsChanged.next(); // Уведомляем об изменении
    return newBooking;
  }

  getBookings(): Booking[] {
    return [...this.bookings];
  }

  checkAvailability(resourceId: number, start: Date, end: Date): Observable<boolean> {
    if (end <= start) {
      return of(false).pipe(delay(500));
    }

    const hasConflict = this.bookings.some(b =>
      b.resourceId === resourceId &&
      start < b.end &&
      end > b.start
    );

    return of(!hasConflict).pipe(delay(500));
  }

  removeBooking(id: number) {
    this.bookings = this.bookings.filter(b => b.id !== id);
    this.bookingsChanged.next();
  }
}
