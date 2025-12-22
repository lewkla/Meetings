import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';

import { BookingService } from '../services/booking.service';
import { ResourceService } from '../services/resource.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatRadioModule
  ],
  template: `
    <div class="booking-container">
      <mat-card class="booking-card glass-effect">
        <mat-card-header class="card-header">
          <div class="header-illustration">
            <mat-icon class="header-icon">calendar_today</mat-icon>
            <div class="icon-orb"></div>
          </div>
          <div class="header-text">
            <mat-card-title class="card-title">Создать встречу</mat-card-title>
            <mat-card-subtitle class="card-subtitle">
              Забронируйте ресурс в несколько кликов
            </mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="booking-form">

            <div class="form-progress">
              <div class="progress-steps">
                <div class="progress-step" [class.active]="currentStep === 1">
                  <div class="step-number">1</div>
                  <div class="step-label">Ресурс</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" [class.active]="currentStep === 2">
                  <div class="step-number">2</div>
                  <div class="step-label">Время</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" [class.active]="currentStep === 3">
                  <div class="step-number">3</div>
                  <div class="step-label">Детали</div>
                </div>
              </div>
            </div>

            <div class="form-content">
              <!-- Шаг 1: Выбор ресурса -->
              <div class="form-step" [class.hidden]="currentStep !== 1">
                <div class="step-header">
                  <h3>
                    <mat-icon class="step-icon">meeting_room</mat-icon>
                    Выберите ресурс
                  </h3>
                  <p class="step-description">Переговорные комнаты, оборудование и другое</p>
                </div>

                <div class="resources-grid">
                  <div *ngFor="let resource of resources"
                       class="resource-card"
                       [class.selected]="bookingForm.get('resourceId')?.value === resource.id"
                       (click)="selectResource(resource.id)">
                    <div class="resource-icon" [style.background]="getResourceColor(resource)">
                      <mat-icon>{{ getResourceIcon(resource.type) }}</mat-icon>
                    </div>
                    <div class="resource-info">
                      <h4>{{ resource.name }}</h4>
                      <p class="resource-type">{{ getResourceTypeText(resource.type) }}</p>
                      <div class="resource-meta">
                        <span *ngIf="resource.capacity">
                          <mat-icon>people</mat-icon>
                          До {{ resource.capacity }} чел.
                        </span>
                        <span class="resource-status available">
                          <mat-icon>check_circle</mat-icon>
                          Доступно
                        </span>
                      </div>
                    </div>
                    <mat-icon class="check-icon" *ngIf="bookingForm.get('resourceId')?.value === resource.id">
                      check_circle
                    </mat-icon>
                  </div>
                </div>
              </div>

              <!-- Шаг 2: Время встречи -->
              <div class="form-step" [class.hidden]="currentStep !== 2">
                <div class="step-header">
                  <h3>
                    <mat-icon class="step-icon">schedule</mat-icon>
                    Укажите время встречи
                  </h3>
                  <p class="step-description">Выберите удобные дату и время</p>
                </div>

                <div class="time-selection">
                  <div class="time-inputs">
                    <mat-form-field appearance="outline" class="time-field">
                      <mat-label>Начало встречи</mat-label>
                      <input matInput type="datetime-local" formControlName="start" required>
                      <mat-icon matPrefix>play_circle</mat-icon>
                      <mat-error *ngIf="bookingForm.get('start')?.hasError('required')">
                        Время начала обязательно
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="time-field">
                      <mat-label>Окончание встречи</mat-label>
                      <input matInput type="datetime-local" formControlName="end" required>
                      <mat-icon matPrefix>stop_circle</mat-icon>
                      <mat-error *ngIf="bookingForm.get('end')?.hasError('required')">
                        Время окончания обязательно
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="quick-times">
                    <div class="quick-times-label">
                      <mat-icon>bolt</mat-icon>
                      <span>Быстрый выбор:</span>
                    </div>
                    <div class="time-chips">
                      <button mat-stroked-button type="button"
                              (click)="setQuickTime(1)"
                              class="time-chip">
                        1 час
                      </button>
                      <button mat-stroked-button type="button"
                              (click)="setQuickTime(1.5)"
                              class="time-chip">
                        1.5 часа
                      </button>
                      <button mat-stroked-button type="button"
                              (click)="setQuickTime(2)"
                              class="time-chip">
                        2 часа
                      </button>
                      <button mat-stroked-button type="button"
                              (click)="setQuickTime(3)"
                              class="time-chip">
                        Пол дня
                      </button>
                    </div>
                  </div>
                </div>

                <div *ngIf="showTimeInfo" class="time-info">
                  <mat-icon class="time-info-icon">info</mat-icon>
                  <p>Продолжительность: {{ getDuration() }}</p>
                </div>
              </div>

              <!-- Шаг 3: Детали встречи -->
              <div class="form-step" [class.hidden]="currentStep !== 3">
                <div class="step-header">
                  <h3>
                    <mat-icon class="step-icon">description</mat-icon>
                    Детали встречи
                  </h3>
                  <p class="step-description">Расскажите о целях и участниках</p>
                </div>

                <div class="meeting-details">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Название встречи</mat-label>
                    <input matInput formControlName="title"
                           placeholder="Ежедневная планерка, Brainstorming...">
                    <mat-icon matPrefix>title</mat-icon>
                    <mat-hint>Будет отображаться в календаре</mat-hint>
                    <mat-error *ngIf="bookingForm.get('title')?.hasError('required')">
                      Название обязательно
                    </mat-error>
                    <mat-error *ngIf="bookingForm.get('title')?.hasError('minlength')">
                      Минимум 3 символа
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Описание встречи (необязательно)</mat-label>
                    <textarea matInput formControlName="description"
                             rows="4"
                             placeholder="Цели, повестка, необходимые материалы..."></textarea>
                    <mat-icon matPrefix>notes</mat-icon>
                  </mat-form-field>

                  <div class="participants-section">
                    <h4>
                      <mat-icon>person_add</mat-icon>
                      Участники
                    </h4>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Добавить участников</mat-label>
                      <input matInput placeholder="Введите email участников через запятую">
                      <mat-icon matPrefix>group</mat-icon>
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </div>

            <!-- Валидационные сообщения -->
            <div *ngIf="showValidationMessages" class="validation-section">
              <div *ngIf="bookingForm.hasError('resourceBusy')" class="validation-message error">
                <mat-icon>error</mat-icon>
                <div class="message-content">
                  <strong>Ресурс занят</strong>
                  <p>Выбранное время уже забронировано. Попробуйте другое время или ресурс.</p>
                </div>
              </div>

              <div *ngIf="bookingForm.hasError('timeInvalid')" class="validation-message error">
                <mat-icon>error</mat-icon>
                <div class="message-content">
                  <strong>Неверное время</strong>
                  <p>Время окончания должно быть позже времени начала.</p>
                </div>
              </div>

              <div *ngIf="bookingForm.valid && !bookingForm.pending" class="validation-message success">
                <mat-icon>check_circle</mat-icon>
                <div class="message-content">
                  <strong>Время доступно!</strong>
                  <p>Ресурс свободен в выбранное время. Можно бронировать.</p>
                </div>
              </div>

              <div *ngIf="bookingForm.pending" class="validation-message info">
                <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
                <div class="message-content">
                  <strong>Проверяем доступность...</strong>
                  <p>Ищем свободные слоты в расписании.</p>
                </div>
              </div>
            </div>

            <!-- Кнопки навигации -->
            <div class="form-navigation">
              <div class="nav-buttons">
                <button mat-stroked-button
                        type="button"
                        (click)="previousStep()"
                        *ngIf="currentStep > 1"
                        class="nav-button">
                  <mat-icon>arrow_back</mat-icon>
                  Назад
                </button>

                <button mat-stroked-button
                        type="button"
                        (click)="nextStep()"
                        *ngIf="currentStep < 3 && isStepValid()"
                        class="nav-button">
                  Далее
                  <mat-icon>arrow_forward</mat-icon>
                </button>

                <button mat-raised-button
                        color="primary"
                        type="submit"
                        [disabled]="bookingForm.invalid || bookingForm.pending"
                        *ngIf="currentStep === 3"
                        class="submit-button">
                  <mat-icon *ngIf="!bookingForm.pending">check</mat-icon>
                  <mat-spinner *ngIf="bookingForm.pending" diameter="20"></mat-spinner>
                  {{ bookingForm.pending ? 'Создание...' : 'Забронировать встречу' }}
                </button>
              </div>

              <button mat-button
                      type="button"
                      (click)="resetForm()"
                      class="reset-button">
                <mat-icon>refresh</mat-icon>
                Начать заново
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Предварительный просмотр -->
      <mat-card *ngIf="bookingForm.get('title')?.value" class="preview-card glass-effect">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>visibility</mat-icon>
            Предварительный просмотр
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="preview-content">
            <div class="preview-item">
              <mat-icon class="preview-icon">meeting_room</mat-icon>
              <div>
                <div class="preview-label">Ресурс</div>
                <div class="preview-value">
                  {{ getResourceName(bookingForm.get('resourceId')?.value) || 'Не выбран' }}
                </div>
              </div>
            </div>
            <div class="preview-item">
              <mat-icon class="preview-icon">schedule</mat-icon>
              <div>
                <div class="preview-label">Время</div>
                <div class="preview-value">
                  {{ bookingForm.get('start')?.value | date:'dd.MM.yyyy HH:mm' }} -
                  {{ bookingForm.get('end')?.value | date:'HH:mm' }}
                </div>
              </div>
            </div>
            <div class="preview-item">
              <mat-icon class="preview-icon">title</mat-icon>
              <div>
                <div class="preview-label">Название</div>
                <div class="preview-value">{{ bookingForm.get('title')?.value || 'Не указано' }}</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .booking-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .booking-card {
      border-radius: 24px !important;
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.95);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 32px 32px 24px;
      background: linear-gradient(135deg, rgba(252, 228, 236, 0.3) 0%, transparent 100%);
      border-bottom: 1px solid rgba(236, 72, 153, 0.1);
    }

    .header-illustration {
      position: relative;
      width: 80px;
      height: 80px;
    }

    .header-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #EC4899;
      position: relative;
      z-index: 2;
    }

    .icon-orb {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 70px;
      height: 70px;
      background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    .header-text {
      flex: 1;
    }

    .card-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 4px 0;
      background: linear-gradient(135deg, #5A2A3A 0%, #EC4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .card-subtitle {
      color: #9D6B7A;
      font-size: 16px;
      font-weight: 400;
      margin: 0;
    }

    .form-progress {
      padding: 24px 32px 0;
    }

    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #FCE4EC;
      color: #9D6B7A;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .step-label {
      font-size: 12px;
      color: #9D6B7A;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-step.active .step-number {
      background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
      border: 2px solid white;
    }

    .progress-step.active .step-label {
      color: #EC4899;
      font-weight: 600;
    }

    .progress-line {
      flex: 1;
      height: 2px;
      background: #FCE4EC;
      min-width: 60px;
      margin-top: -20px;
    }

    .form-content {
      padding: 32px;
    }

    .form-step {
      animation: fadeIn 0.3s ease-out;
    }

    .form-step.hidden {
      display: none;
    }

    .step-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .step-header h3 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 22px;
      color: #5A2A3A;
      margin: 0 0 8px 0;
    }

    .step-icon {
      color: #EC4899;
      font-size: 28px;
    }

    .step-description {
      color: #9D6B7A;
      font-size: 16px;
      margin: 0;
    }

    .resources-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .resource-card {
      padding: 20px;
      border-radius: 16px;
      background: white;
      border: 2px solid #FCE4EC;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
    }

    .resource-card:hover {
      border-color: #EC4899;
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.1);
      transform: translateY(-2px);
    }

    .resource-card.selected {
      border-color: #EC4899;
      background: linear-gradient(135deg, rgba(252, 228, 236, 0.2) 0%, rgba(255, 255, 255, 1) 100%);
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.15);
    }

    .resource-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .resource-icon mat-icon {
      color: white;
      font-size: 28px;
    }

    .resource-info {
      flex: 1;
      min-width: 0;
    }

    .resource-info h4 {
      margin: 0 0 4px 0;
      color: #5A2A3A;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .resource-type {
      color: #9D6B7A;
      font-size: 12px;
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .resource-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #5A2A3A;
    }

    .resource-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .resource-meta mat-icon {
      font-size: 16px;
    }

    .resource-status {
      font-weight: 500;
    }

    .resource-status.available {
      color: #10B981;
    }

    .check-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      color: #EC4899;
      font-size: 24px;
    }

    .time-selection {
      max-width: 600px;
      margin: 0 auto;
    }

    .time-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .time-field {
      width: 100%;
    }

    .quick-times {
      background: #F8F9FA;
      border-radius: 12px;
      padding: 20px;
    }

    .quick-times-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #5A2A3A;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .quick-times-label mat-icon {
      color: #EC4899;
    }

    .time-chips {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .time-chip {
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .time-chip:hover {
      background: #EC4899;
      color: white;
      border-color: #EC4899;
    }

    .time-info {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(236, 72, 153, 0.1);
      padding: 16px;
      border-radius: 12px;
      margin-top: 24px;
    }

    .time-info-icon {
      color: #EC4899;
      font-size: 24px;
    }

    .time-info p {
      margin: 0;
      color: #5A2A3A;
      font-weight: 500;
    }

    .meeting-details {
      max-width: 600px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }

    .participants-section {
      margin-top: 32px;
    }

    .participants-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #5A2A3A;
      margin: 0 0 16px 0;
    }

    .participants-section mat-icon {
      color: #EC4899;
    }

    .validation-section {
      margin: 32px 0;
    }

    .validation-message {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      animation: fadeIn 0.3s ease-out;
    }

    .validation-message.error {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #EF4444;
    }

    .validation-message.success {
      background: rgba(16, 185, 129, 0.1);
      border-left: 4px solid #10B981;
    }

    .validation-message.info {
      background: rgba(59, 130, 246, 0.1);
      border-left: 4px solid #3B82F6;
    }

    .validation-message mat-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .validation-message.error mat-icon {
      color: #EF4444;
    }

    .validation-message.success mat-icon {
      color: #10B981;
    }

    .validation-message.info mat-progress-spinner {
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
    }

    .message-content strong {
      display: block;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .message-content p {
      margin: 0;
      color: #5A2A3A;
      opacity: 0.8;
      font-size: 14px;
    }

    .form-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid rgba(236, 72, 153, 0.1);
    }

    .nav-buttons {
      display: flex;
      gap: 12px;
    }

    .nav-button {
      padding: 8px 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .submit-button {
      padding: 10px 32px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 200px;
      background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
      color: white;
      border-radius: 12px;
    }

    .reset-button {
      color: #9D6B7A;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-card {
      border-radius: 20px !important;
      margin-top: 24px;
    }

    .preview-card mat-card-header {
      border-bottom: 1px solid rgba(236, 72, 153, 0.1);
      padding: 20px;
    }

    .preview-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #5A2A3A;
    }

    .preview-card mat-card-title mat-icon {
      color: #EC4899;
    }

    .preview-content {
      padding: 20px;
    }

    .preview-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(236, 72, 153, 0.1);
    }

    .preview-item:last-child {
      border-bottom: none;
    }

    .preview-icon {
      color: #EC4899;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .preview-label {
      font-size: 12px;
      color: #9D6B7A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .preview-value {
      font-size: 14px;
      color: #5A2A3A;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .resources-grid {
        grid-template-columns: 1fr;
      }

      .time-inputs {
        grid-template-columns: 1fr;
      }

      .form-navigation {
        flex-direction: column;
        gap: 16px;
      }

      .nav-buttons {
        width: 100%;
        flex-direction: column;
      }

      .submit-button {
        width: 100%;
        justify-content: center;
      }

      .card-header {
        flex-direction: column;
        text-align: center;
      }

      .progress-steps {
        flex-direction: column;
        align-items: flex-start;
      }

      .progress-line {
        width: 2px;
        height: 40px;
        margin: 0 0 0 19px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `]
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  resources: any[] = [];
  showValidationMessages = false;
  currentStep = 1;
  showTimeInfo = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private resourceService: ResourceService,
    private snackBar: MatSnackBar
  ) {
    this.bookingForm = this.fb.group({
      resourceId: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    }, {
      asyncValidators: this.availabilityValidator.bind(this),
      validators: this.timeValidator
    });

    this.bookingForm.valueChanges.subscribe(() => {
      this.showValidationMessages = true;
    });
  }

  ngOnInit() {
    this.resources = this.resourceService.getResources();
  }

  availabilityValidator(control: AbstractControl): Observable<{ [key: string]: any } | null> {
    const resourceId = control.get('resourceId')?.value;
    const start = control.get('start')?.value;
    const end = control.get('end')?.value;

    if (!resourceId || !start || !end) {
      return of(null);
    }

    return this.bookingService.checkAvailability(
      resourceId,
      new Date(start),
      new Date(end)
    ).pipe(
      map(available => available ? null : { resourceBusy: true })
    );
  }

  timeValidator(group: AbstractControl): { [key: string]: any } | null {
    const start = group.get('start')?.value;
    const end = group.get('end')?.value;

    if (start && end && new Date(end) <= new Date(start)) {
      return { timeInvalid: true };
    }
    return null;
  }

  getResourceColor(resource: any): string {
    const colors = [
      'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    ];
    return colors[resource.id % colors.length];
  }

  getResourceIcon(type: string): string {
    return type === 'room' ? 'meeting_room' : 'devices';
  }

  getResourceTypeText(type: string): string {
    return type === 'room' ? 'Переговорная комната' : 'Оборудование';
  }

  selectResource(resourceId: number) {
    this.bookingForm.get('resourceId')?.setValue(resourceId);
    if (this.currentStep === 1) {
      this.nextStep();
    }
  }

  setQuickTime(hours: number) {
    const start = new Date();
    start.setMinutes(0, 0, 0);

    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

    const formatDateTime = (date: Date) => {
      return date.toISOString().slice(0, 16);
    };

    this.bookingForm.get('start')?.setValue(formatDateTime(start));
    this.bookingForm.get('end')?.setValue(formatDateTime(end));
    this.showTimeInfo = true;
  }

  getDuration(): string {
    const start = this.bookingForm.get('start')?.value;
    const end = this.bookingForm.get('end')?.value;

    if (!start || !end) return '';

    const duration = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} час${hours > 1 ? 'а' : ''} ${minutes > 0 ? `и ${minutes} минут${minutes > 1 ? 'ы' : 'а'}` : ''}`;
    }
    return `${minutes} минут${minutes > 1 ? 'ы' : 'а'}`;
  }

  getResourceName(resourceId: number): string {
    const resource = this.resources.find(r => r.id === resourceId);
    return resource ? resource.name : '';
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.bookingForm.get('resourceId')?.valid ?? false;
      case 2:
        return (this.bookingForm.get('start')?.valid && this.bookingForm.get('end')?.valid) ?? false;
      case 3:
        return this.bookingForm.get('title')?.valid ?? false;
      default:
        return false;
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const value = this.bookingForm.value;

      this.bookingService.addBooking({
        resourceId: value.resourceId,
        start: new Date(value.start),
        end: new Date(value.end),
        title: value.title
      });

      this.snackBar.open('✨ Встреча успешно создана!', 'Закрыть', {
        duration: 5000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });

      this.resetForm();

      setTimeout(() => {
      }, 100);
    }
  }

  resetForm() {
    this.bookingForm.reset();
    this.currentStep = 1;
    this.showValidationMessages = false;
    this.showTimeInfo = false;
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.get(key)?.setErrors(null);
    });
  }
}
