import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BookingFormComponent } from './components/booking-form.component';
import { CalendarComponent } from './components/calendar.component';
import { ResourceManagementComponent } from './components/resource-management.component';
import { BookingService } from './services/booking.service';
import { ResourceService } from './services/resource.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    BookingFormComponent,
    CalendarComponent,
    ResourceManagementComponent
  ],
  template: `
    <div class="app-container">
      <!-- Верхняя панель -->
      <mat-toolbar color="primary" class="main-header">
        <div class="header-content">
          <div class="logo-section">
            <mat-icon class="logo-icon">calendar_today</mat-icon>
            <h1 class="app-title">Планирование встреч</h1>
          </div>
        </div>
      </mat-toolbar>

      <!-- Основной контент -->
      <main class="main-content">
        <!-- Статистика сверху -->
        <div class="stats-bar">
          <div class="stat-card">
            <mat-icon class="stat-icon">event</mat-icon>
            <div class="stat-content">
              <div class="stat-number">{{ getTotalBookings() }}</div>
              <div class="stat-label">Всего бронирований</div>
            </div>
          </div>
          
          <div class="stat-card">
            <mat-icon class="stat-icon">meeting_room</mat-icon>
            <div class="stat-content">
              <div class="stat-number">{{ getTotalResources() }}</div>
              <div class="stat-label">Доступных ресурсов</div>
            </div>
          </div>
        </div>

        <!-- Основные кнопки действий -->
        <div class="action-buttons">
          <button mat-raised-button color="primary" class="main-action-btn" (click)="scrollToBooking()">
            <mat-icon>add</mat-icon>
            Новое бронирование
          </button>
          
          <button mat-stroked-button color="accent" class="secondary-action-btn" (click)="scrollToCalendar()">
            <mat-icon>calendar_month</mat-icon>
            Календарь
          </button>
          
          <button mat-stroked-button color="accent" class="secondary-action-btn" (click)="scrollToResources()">
            <mat-icon>meeting_room</mat-icon>
            Ресурсы
          </button>
        </div>

        <!-- Контент -->
        <div class="content-sections">
          <!-- Секция бронирований -->
          <mat-card class="content-card" id="booking-section">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>event_available</mat-icon>
                Новое бронирование
              </mat-card-title>
              <mat-card-subtitle>Создайте новую встречу</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-booking-form (bookingCreated)="onBookingCreated()"></app-booking-form>
            </mat-card-content>
          </mat-card>

          <!-- Секция календаря -->
          <mat-card class="content-card" id="calendar-section">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>calendar_month</mat-icon>
                Календарь бронирований
              </mat-card-title>
              <mat-card-subtitle>Просмотр всех запланированных встреч</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-calendar (bookingDeleted)="onBookingDeleted()"></app-calendar>
            </mat-card-content>
          </mat-card>

          <!-- Секция ресурсов -->
          <mat-card class="content-card" id="resources-section">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>meeting_room</mat-icon>
                Управление ресурсами
              </mat-card-title>
              <mat-card-subtitle>Добавление и удаление ресурсов</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-resource-management (resourceChanged)="onResourceChanged()"></app-resource-management>
            </mat-card-content>
          </mat-card>
        </div>
      </main>

      <!-- Футер -->
      <footer class="app-footer">
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%);
      display: flex;
      flex-direction: column;
    }

    .main-header {
      padding: 0 24px;
      background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
      box-shadow: 0 3px 5px -1px rgba(233, 30, 99, 0.2);
    }

    .header-content {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
      color: white;
    }

    .app-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: white;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }

    /* Статистика */
    .stats-bar {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .stat-card {
      flex: 1;
      min-width: 200px;
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid #ffcce0;
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.05);
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(233, 30, 99, 0.1);
    }

    .stat-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      color: #e91e63;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #e91e63;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: #888;
      margin-top: 6px;
    }

    /* Основные кнопки действий */
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .main-action-btn {
      padding: 12px 32px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 500;
      background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .main-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
    }

    .secondary-action-btn {
      padding: 10px 24px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-color: #e91e63 !important;
      color: #e91e63 !important;
    }

    .secondary-action-btn:hover {
      background: rgba(233, 30, 99, 0.1);
      transform: translateY(-2px);
    }

    /* Секции контента */
    .content-sections {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .content-card {
      border-radius: 20px;
      border: 1px solid #ffcce0;
      background: white;
      box-shadow: 0 4px 20px rgba(233, 30, 99, 0.08);
    }

    .content-card mat-card-header {
      background: linear-gradient(135deg, #fff5f8, #ffe4ec);
      padding: 20px;
      border-radius: 20px 20px 0 0;
    }

    .content-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #e91e63;
      font-weight: 600;
      margin: 0;
    }

    .content-card mat-card-subtitle {
      color: #888;
      margin-top: 4px;
    }

    .app-footer {
      background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
      color: white;
      padding: 20px;
      text-align: center;
      margin-top: 40px;
    }

    .app-footer p {
      margin: 0;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .main-action-btn, .secondary-action-btn {
        width: 100%;
        max-width: 300px;
        justify-content: center;
      }

      .stats-bar {
        flex-direction: column;
      }
    }
  `]
})
export class App {
  constructor(
    private bookingService: BookingService,
    private resourceService: ResourceService
  ) {}

  getTotalBookings(): number {
    return this.bookingService.getBookings().length;
  }

  getTotalResources(): number {
    return this.resourceService.getTotalResources();
  }

  scrollToBooking() {
    document.getElementById('booking-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  scrollToCalendar() {
    document.getElementById('calendar-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  scrollToResources() {
    document.getElementById('resources-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  onBookingCreated() {
  }

  onBookingDeleted() {
  }

  onResourceChanged() {
  }
}