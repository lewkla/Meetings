import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { BookingService } from '../services/booking.service';
import { ResourceService } from '../services/resource.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    DatePipe
  ],
  template: `
    <div class="calendar-container">
      <div class="calendar-header glass-effect">
        <div class="header-content">
          <div class="header-title">
            <mat-icon class="header-icon">calendar_month</mat-icon>
            <div>
              <h2>Календарь встреч</h2>
              <p class="header-subtitle">Планируйте и управляйте встречами</p>
            </div>
          </div>

          <div class="header-controls">
            <div class="view-controls">
              <button mat-stroked-button [class.active]="view === 'week'"
                      (click)="view = 'week'">
                <mat-icon>view_week</mat-icon>
                Неделя
              </button>
              <button mat-stroked-button [class.active]="view === 'list'"
                      (click)="view = 'list'">
                <mat-icon>list</mat-icon>
                Список
              </button>
            </div>

            <div class="date-controls">
              <button mat-icon-button (click)="previousPeriod()" class="nav-button">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <div class="current-period">
                <h3>{{ getPeriodTitle() }}</h3>
                <div class="period-info">
                  <mat-icon>today</mat-icon>
                  <span>{{ getPeriodInfo() }}</span>
                </div>
              </div>
              <button mat-icon-button (click)="nextPeriod()" class="nav-button">
                <mat-icon>chevron_right</mat-icon>
              </button>
              <button mat-stroked-button (click)="goToToday()" class="today-button">
                <mat-icon>today</mat-icon>
                Сегодня
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Недельный вид -->
      <div *ngIf="view === 'week'" class="week-view">
        <div class="week-grid">
          <!-- Заголовки дней -->
          <div class="grid-header"></div>
          <div *ngFor="let day of weekDays" class="day-header">
            <div class="day-card" [class.today]="isToday(day.date)">
              <div class="day-name">{{ day.name }}</div>
              <div class="day-date">{{ day.date | date:'d' }}</div>
              <div class="day-month">{{ day.date | date:'MMM' }}</div>
            </div>
          </div>

          <!-- Временные слоты -->
          <div *ngFor="let timeSlot of timeSlots" class="time-slot">
            <div class="time-label">{{ timeSlot }}</div>
            <div *ngFor="let day of weekDays" 
                 class="calendar-cell"
                 [class.has-booking]="hasBooking(day.date, timeSlot)"
                 [class.current-time]="isCurrentTime(day.date, timeSlot)">
              
              <div *ngFor="let booking of getBookingsForDayAndTime(day.date, timeSlot)"
                   class="booking-card"
                   [style.border-left-color]="getResourceColor(booking.resourceId)">
                <div class="booking-content">
                  <div class="booking-header">
                    <div class="booking-title">{{ booking.title }}</div>
                    <mat-icon class="booking-icon">event</mat-icon>
                  </div>
                  <div class="booking-time">{{ booking.start | date:'HH:mm' }} - {{ booking.end | date:'HH:mm' }}</div>
                  <div class="booking-resource">
                    <mat-icon class="resource-icon">place</mat-icon>
                    {{ getResourceName(booking.resourceId) }}
                  </div>
                </div>
              </div>

              <!-- Индикатор текущего времени -->
              <div *ngIf="isCurrentTime(day.date, timeSlot)" class="current-time-indicator">
                <div class="indicator-dot"></div>
                <div class="indicator-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Список встреч -->
      <div *ngIf="view === 'list'" class="list-view">
        <div class="list-header">
          <h3>Предстоящие встречи</h3>
        </div>
        <div class="bookings-list">
          <div *ngFor="let booking of getUpcomingBookings()" class="booking-list-item">
            <div class="booking-list-content">
              <div class="booking-list-time">
                <div class="booking-date">{{ booking.start | date:'dd MMM' }}</div>
                <div class="booking-time-slot">
                  {{ booking.start | date:'HH:mm' }} - {{ booking.end | date:'HH:mm' }}
                </div>
              </div>
              <div class="booking-list-details">
                <div class="booking-list-title">{{ booking.title }}</div>
                <div class="booking-list-resource">
                  <mat-icon class="resource-icon">meeting_room</mat-icon>
                  {{ getResourceName(booking.resourceId) }}
                </div>
                <div class="booking-list-duration">
                  <mat-icon>schedule</mat-icon>
                  Продолжительность: {{ getBookingDuration(booking) }}
                </div>
              </div>
              <div class="booking-list-actions">
                <button mat-icon-button color="warn" (click)="deleteBooking(booking)" 
                        class="delete-button" matTooltip="Удалить встречу">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
    }

    .calendar-header {
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.9);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 24px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-title h2 {
      margin: 0;
      color: #5A2A3A;
      font-size: 28px;
      font-weight: 700;
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      color: #9D6B7A;
      font-size: 14px;
    }

    .header-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: flex-end;
    }

    .view-controls {
      display: flex;
      gap: 8px;
    }

    .view-controls button {
      border-radius: 12px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .view-controls button.active {
      background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
      color: white;
      border-color: transparent;
    }

    .date-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .nav-button {
      color: #9D6B7A;
    }

    .current-period {
      text-align: center;
      min-width: 200px;
    }

    .current-period h3 {
      margin: 0;
      color: #5A2A3A;
      font-size: 18px;
      font-weight: 600;
    }

    .period-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #9D6B7A;
      font-size: 12px;
      margin-top: 4px;
    }

    .period-info mat-icon {
      font-size: 14px;
    }

    .today-button {
      border-radius: 12px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%);
      border-color: rgba(236, 72, 153, 0.2);
    }

    .week-view {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(236, 72, 153, 0.08);
    }

    .week-grid {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
    }

    .grid-header {
      background: linear-gradient(135deg, #FCE4EC 0%, #FFF5F7 100%);
      border-bottom: 1px solid rgba(236, 72, 153, 0.1);
    }

    .day-header {
      background: linear-gradient(135deg, #FCE4EC 0%, #FFF5F7 100%);
      border-bottom: 1px solid rgba(236, 72, 153, 0.1);
      border-right: 1px solid rgba(236, 72, 153, 0.1);
    }

    .day-header:last-child {
      border-right: none;
    }

    .day-card {
      padding: 16px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .day-card.today {
      background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
      color: white;
      border-radius: 12px;
      margin: 4px;
      padding: 12px;
    }

    .day-name {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      color: inherit;
    }

    .day-date {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 2px;
      color: inherit;
    }

    .day-month {
      font-size: 11px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: inherit;
    }

    .time-slot {
      display: contents;
    }

    .time-label {
      padding: 12px;
      background: #F8F9FA;
      border-bottom: 1px solid rgba(236, 72, 153, 0.1);
      text-align: center;
      font-weight: 600;
      color: #5A2A3A;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .calendar-cell {
      padding: 8px;
      border-right: 1px solid rgba(236, 72, 153, 0.1);
      border-bottom: 1px solid rgba(236, 72, 153, 0.1);
      min-height: 100px;
      background: rgba(255, 245, 247, 0.3);
      position: relative;
      transition: background 0.2s;
    }

    .calendar-cell.has-booking {
      background: rgba(236, 72, 153, 0.02);
    }

    .calendar-cell.current-time {
      background: rgba(236, 72, 153, 0.08);
    }

    .calendar-cell:last-child {
      border-right: none;
    }

    .booking-card {
      position: absolute;
      left: 4px;
      right: 4px;
      top: 4px;
      bottom: 4px;
      background: white;
      border-radius: 8px;
      border-left: 4px solid;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 1;
    }

    .booking-content {
      flex: 1;
      padding: 12px;
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .booking-title {
      font-weight: 600;
      font-size: 13px;
      color: #5A2A3A;
      line-height: 1.3;
      flex: 1;
    }

    .booking-icon {
      color: #EC4899;
      font-size: 16px;
    }

    .booking-time {
      font-size: 11px;
      color: #9D6B7A;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .booking-resource {
      font-size: 10px;
      color: #5A2A3A;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    .resource-icon {
      font-size: 12px;
      opacity: 0.7;
    }

    .current-time-indicator {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: #EC4899;
      z-index: 2;
      pointer-events: none;
    }

    .indicator-dot {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #EC4899;
      border-radius: 50%;
      top: -3px;
      left: 0;
    }

    .indicator-line {
      position: absolute;
      left: 8px;
      right: 0;
      height: 2px;
      background: #EC4899;
    }

    .list-view {
      background: white;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(236, 72, 153, 0.08);
    }

    .list-header {
      margin-bottom: 24px;
    }

    .list-header h3 {
      margin: 0;
      color: #5A2A3A;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .booking-list-item {
      padding: 16px;
      border-radius: 12px;
      background: #F8F9FA;
      border: 1px solid rgba(236, 72, 153, 0.1);
      transition: all 0.3s ease;
    }

    .booking-list-item:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.1);
      transform: translateY(-2px);
    }

    .booking-list-content {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .booking-list-time {
      text-align: center;
      min-width: 100px;
      padding: 8px;
      background: white;
      border-radius: 8px;
      border: 1px solid rgba(236, 72, 153, 0.1);
    }

    .booking-date {
      font-size: 12px;
      color: #EC4899;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .booking-time-slot {
      font-size: 14px;
      color: #5A2A3A;
      font-weight: 600;
      margin-top: 4px;
    }

    .booking-list-details {
      flex: 1;
    }

    .booking-list-title {
      font-size: 16px;
      font-weight: 600;
      color: #5A2A3A;
      margin-bottom: 4px;
    }

    .booking-list-resource,
    .booking-list-duration {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #9D6B7A;
      margin-top: 2px;
    }

    .booking-list-actions {
      display: flex;
      gap: 8px;
    }

    .delete-button {
      color: #EF4444;
    }

    .delete-button:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .header-controls {
        align-items: center;
        width: 100%;
      }

      .view-controls {
        justify-content: center;
        width: 100%;
      }

      .date-controls {
        flex-direction: column;
        gap: 12px;
      }

      .week-grid {
        grid-template-columns: 60px repeat(7, 1fr);
        font-size: 12px;
      }

      .day-card {
        padding: 8px;
      }

      .booking-card {
        padding: 4px;
      }

      .booking-title {
        font-size: 11px;
      }

      .booking-list-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .booking-list-time {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .booking-list-actions {
        justify-content: flex-end;
        margin-top: 12px;
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  bookings: any[] = [];
  resources: any[] = [];
  currentDate = new Date();
  view: 'week' | 'list' = 'week';

  timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00'
  ];

  weekDays: { date: Date; name: string }[] = [];

  constructor(
    private bookingService: BookingService,
    private resourceService: ResourceService
  ) {}

  ngOnInit() {
    this.bookings = this.bookingService.getBookings();
    this.resources = this.resourceService.getResources();
    this.generateWeekDays();
  }

  generateWeekDays() {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    this.weekDays = [];
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      this.weekDays.push({
        date: date,
        name: daysOfWeek[i]
      });
    }
  }

  getPeriodTitle(): string {
    if (this.view === 'week' && this.weekDays.length > 0) {
      const first = this.weekDays[0].date;
      const last = this.weekDays[6].date;
      return `${first.getDate()} - ${last.getDate()} ${this.getMonthName(last.getMonth())}`;
    }
    return this.currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  }

  getPeriodInfo(): string {
    if (this.view === 'week') {
      return 'Неделя ' + Math.ceil((this.currentDate.getDate() + new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay()) / 7);
    }
    return '';
  }

  getMonthName(month: number): string {
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return months[month];
  }

  previousPeriod() {
    if (this.view === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
      this.generateWeekDays();
    }
  }

  nextPeriod() {
    if (this.view === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
      this.generateWeekDays();
    }
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateWeekDays();
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  }

  isCurrentTime(day: Date, timeSlot: string): boolean {
    const now = new Date();
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date(day);
    slotTime.setHours(hours, minutes, 0, 0);
    
    const nextSlotTime = new Date(slotTime);
    nextSlotTime.setHours(hours + 1, minutes, 0, 0);
    
    return now >= slotTime && now < nextSlotTime && this.isToday(day);
  }

  hasBooking(day: Date, timeSlot: string): boolean {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotStart = new Date(day);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hours + 1, minutes, 0, 0);

    return this.bookings.some(booking => {
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      return bookingStart < slotEnd && bookingEnd > slotStart &&
        bookingStart.getDate() === day.getDate() &&
        bookingStart.getMonth() === day.getMonth() &&
        bookingStart.getFullYear() === day.getFullYear();
    });
  }

  getBookingsForDayAndTime(day: Date, timeSlot: string): any[] {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotStart = new Date(day);
    slotStart.setHours(hours, minutes, 0, 0);

    return this.bookings.filter(booking => {
      const bookingStart = new Date(booking.start);
      return bookingStart.getDate() === day.getDate() &&
        bookingStart.getMonth() === day.getMonth() &&
        bookingStart.getFullYear() === day.getFullYear() &&
        bookingStart.getHours() === hours;
    });
  }

  getResourceColor(resource: any): string {
    const colors = [
      '#EC4899', '#8B5CF6', '#10B981', '#3B82F6',
      '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'
    ];
    return colors[resource.id % colors.length];
  }

  getResourceName(resourceId: number): string {
    const resource = this.resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'Неизвестно';
  }

  getUpcomingBookings() {
    const now = new Date();
    return this.bookings
      .filter(b => new Date(b.start) >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  getBookingDuration(booking: any): string {
    const duration = new Date(booking.end).getTime() - new Date(booking.start).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ч ${minutes > 0 ? `${minutes} мин` : ''}`;
    }
    return `${minutes} мин`;
  }

  deleteBooking(booking: any): void {
    if (confirm('Удалить эту встречу?')) {
      this.bookingService.removeBooking(booking.id);
      this.bookings = this.bookingService.getBookings();
    }
  }
}