import { Injectable } from '@angular/core';
import { Booking } from '../models/booking.model';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private bookings: Booking[] = [
    { id: 1, resourceId: 1, start: new Date(), end: new Date(Date.now() + 3600000), title: 'Планерка' },
    { id: 2, resourceId: 2, start: new Date(Date.now() + 7200000), end: new Date(Date.now() + 10800000), title: 'Совещание' }
  ];

  addBooking(booking: Omit<Booking, 'id'>) {
    const newBooking: Booking = {
      ...booking,
      id: Date.now()
    };
    this.bookings.push(newBooking);
  }

  getBookings() {
    return this.bookings;
  }

  checkAvailability(resourceId: number, start: Date, end: Date): Observable<boolean> {
    const hasConflict = this.bookings.some(b =>
      b.resourceId === resourceId &&
      start < b.end &&
      end > b.start
    );
    return of(!hasConflict).pipe(delay(500));
  }

  removeBooking(id: number) {
    this.bookings = this.bookings.filter(b => b.id !== id);
  }
}
