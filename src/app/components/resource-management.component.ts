import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourceService } from '../services/resource.service';

@Component({
  selector: 'app-resource-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="resource-container">
      <div class="content-wrapper">
        <!-- Левая часть - форма добавления -->
        <div class="form-section">
          <div class="add-resource-card">
            <h3>Добавить новый ресурс</h3>
            
            <form [formGroup]="resourceForm" (ngSubmit)="addResource()" class="resource-form">
              <div class="form-group">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Название ресурса</mat-label>
                  <input matInput formControlName="name" placeholder="Конференц-зал Alpha">
                  <mat-icon matPrefix>meeting_room</mat-icon>
                  <mat-error *ngIf="resourceForm.get('name')?.hasError('required')">
                    Введите название
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Тип ресурса</mat-label>
                  <mat-select formControlName="type" required>
                    <mat-option value="room">Переговорная комната</mat-option>
                    <mat-option value="equipment">Оборудование</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>category</mat-icon>
                  <mat-error *ngIf="resourceForm.get('type')?.hasError('required')">
                    Выберите тип ресурса
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field" *ngIf="resourceForm.get('type')?.value === 'room'">
                  <mat-label>Вместимость (чел.)</mat-label>
                  <input matInput type="number" formControlName="capacity" min="1" max="100" value="10">
                  <mat-icon matPrefix>people</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-raised-button 
                        color="primary" 
                        type="submit" 
                        class="add-button"
                        [disabled]="resourceForm.invalid">
                  <mat-icon>add</mat-icon>
                  Добавить
                </button>
                
                <button mat-stroked-button 
                        type="button" 
                        color="warn" 
                        class="clear-button"
                        (click)="clearForm()">
                  <mat-icon>clear</mat-icon>
                  Очистить
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Правая часть - список ресурсов -->
        <div class="list-section">
          <div class="resources-card">
            <h3>Список ресурсов ({{ resources.length }})</h3>

            <div *ngIf="resources.length === 0" class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>Ресурсы не добавлены</p>
              <small>Добавьте первый ресурс, используя форму слева</small>
            </div>

            <div class="resources-list" *ngIf="resources.length > 0">
              <div *ngFor="let resource of resources" class="resource-item">
                <div class="resource-icon">
                  <mat-icon>{{ resource.type === 'room' ? 'meeting_room' : 'devices' }}</mat-icon>
                </div>
                
                <div class="resource-info">
                  <h4>{{ resource.name }}</h4>
                  <div class="resource-details">
                    <span class="resource-type">{{ resource.type === 'room' ? 'Комната' : 'Оборудование' }}</span>
                    <span *ngIf="resource.type === 'room'" class="capacity">
                      <mat-icon>people</mat-icon>
                      {{ resource.capacity }} чел.
                    </span>
                  </div>
                </div>
                
                <button mat-icon-button 
                        color="warn" 
                        class="delete-btn" 
                        (click)="removeResource(resource.id)"
                        title="Удалить">
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
    .resource-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 10px;
    }

    .content-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    @media (max-width: 992px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }
    }

    .add-resource-card, .resources-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #ffcce0;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(233, 30, 99, 0.08);
      height: 100%;
    }

    h3 {
      color: #e91e63;
      font-weight: 600;
      margin: 0 0 20px 0;
      font-size: 20px;
    }

    .resource-form {
      padding: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }

    .form-field {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #ffe4ec;
    }

    .add-button {
      border-radius: 50px;
      padding: 10px 30px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
    }

    .add-button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
    }

    .clear-button {
      border-radius: 50px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .clear-button:hover {
      background: rgba(244, 67, 54, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #ccc;
    }

    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 16px;
      margin: 8px 0;
      color: #666;
    }

    .empty-state small {
      font-size: 14px;
      color: #999;
    }

    .resources-list {
      padding: 0;
      max-height: 400px;
      overflow-y: auto;
    }

    .resource-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.3s ease;
    }

    .resource-item:last-child {
      border-bottom: none;
    }

    .resource-item:hover {
      background: #f9f9f9;
    }

    .resource-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .resource-item:nth-child(odd) .resource-icon {
      background: linear-gradient(135deg, #ffe4ec, #ffcce0);
      color: #e91e63;
    }

    .resource-item:nth-child(even) .resource-icon {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      color: #2196f3;
    }

    .resource-icon mat-icon {
      font-size: 20px;
    }

    .resource-info {
      flex: 1;
    }

    .resource-info h4 {
      margin: 0 0 6px 0;
      font-size: 15px;
      color: #333;
      font-weight: 600;
    }

    .resource-details {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .resource-type, .capacity {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 3px 8px;
      border-radius: 10px;
      font-weight: 500;
    }

    .resource-type {
      background: linear-gradient(135deg, #f0f4ff, #e6ebff);
      color: #3f51b5;
    }

    .capacity {
      background: linear-gradient(135deg, #e8f5e9, #d4edda);
      color: #2e7d32;
    }

    .capacity mat-icon {
      font-size: 12px;
      height: 12px;
      width: 12px;
    }

    .delete-btn {
      transition: all 0.3s ease;
      border-radius: 50%;
    }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 0.1);
      transform: scale(1.1);
    }

    /* Стилизация скроллбара */
    .resources-list::-webkit-scrollbar {
      width: 6px;
    }

    .resources-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .resources-list::-webkit-scrollbar-thumb {
      background: #ffcce0;
      border-radius: 10px;
    }

    .resources-list::-webkit-scrollbar-thumb:hover {
      background: #e91e63;
    }

    @media (max-width: 768px) {
      .resource-container {
        padding: 10px;
      }

      .content-wrapper {
        gap: 20px;
      }

      .form-actions {
        flex-direction: column;
      }

      .add-button, .clear-button {
        width: 100%;
        justify-content: center;
      }

      .resource-details {
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  `]
})
export class ResourceManagementComponent implements OnInit {
  @Output() resourceChanged = new EventEmitter<void>();
  
  resourceForm: FormGroup;
  resources: any[] = [];

  constructor(
    private fb: FormBuilder,
    private resourceService: ResourceService,
    private snackBar: MatSnackBar
  ) {
    this.resourceForm = this.fb.group({
      name: ['', Validators.required],
      type: ['room', Validators.required],
      capacity: [10]
    });
  }

  ngOnInit() {
    this.resources = this.resourceService.getResources();
  }

  addResource() {
    if (this.resourceForm.valid) {
      const value = this.resourceForm.value;
      this.resourceService.addResource(
        value.name,
        value.type,
        value.type === 'room' ? value.capacity : undefined
      );
      
      this.resources = this.resourceService.getResources();
      this.clearForm();
      
      this.resourceChanged.emit();
      
      this.snackBar.open('✅ Ресурс добавлен!', 'ОК', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  clearForm() {
    this.resourceForm.reset({
      type: 'room',
      capacity: 10
    });
  }

  removeResource(id: number) {
    if (confirm('Удалить этот ресурс?')) {
      this.resourceService.removeResource(id);
      this.resources = this.resourceService.getResources();
      
      this.resourceChanged.emit();
      
      this.snackBar.open('🗑️ Ресурс удален', 'ОК', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}