import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectionsService } from '../../../../../features/elections/services/elections.service';

interface SystemInfo {
  admin: string;
  state: {
    state: number;
    stateName: string;
  };
  contestantsCount: number;
  contractAddress: string;
}

@Component({
  selector: 'app-change-state',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-state-component.html',
  styleUrls: ['./change-state-component.css']
})
export class ChangeStateComponent implements OnInit {
  systemInfo: SystemInfo | null = null;
  newState: number | null = null;
  privateKey = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  transactionHash = '';

  constructor(
    private router: Router,
    private electionsService: ElectionsService
  ) {}

  ngOnInit(): void {
    this.loadSystemInfo();
  }

  loadSystemInfo(): void {
    this.electionsService.getSystemInfo().subscribe({
      next: (info: any) => {
        this.systemInfo = info;
      },
      error: (error) => {
        console.error('Error loading system info:', error);
        this.errorMessage = 'حدث خطأ في تحميل معلومات النظام';
      }
    });
  }

  getStateName(state: number | undefined): string {
    if (state === undefined) return 'غير معروف';
    
    switch(state) {
      case 0: return 'مرحلة التسجيل';
      case 1: return 'مرحلة التصويت';
      case 2: return 'انتهاء الانتخاب';
      default: return 'غير معروف';
    }
  }

  getStateDescription(state: number | undefined): string {
    if (state === undefined) return '';
    
    switch(state) {
      case 0: return 'التسجيل مفتوح للناخبين الجدد';
      case 1: return 'التصويت مفتوح للناخبين المسجلين';
      case 2: return 'الانتخابات انتهت والتصويت مغلق';
      default: return '';
    }
  }

  getStateIcon(state: number | undefined): string {
    if (state === undefined) return '❓';
    
    switch(state) {
      case 0: return '📝';
      case 1: return '✅';
      case 2: return '⛔';
      default: return '❓';
    }
  }

  getStateClass(state: number | undefined): string {
    if (state === undefined) return '';
    
    switch(state) {
      case 0: return 'registration';
      case 1: return 'voting';
      case 2: return 'ended';
      default: return '';
    }
  }

  selectState(state: number): void {
    this.newState = state;
    this.errorMessage = '';
    this.successMessage = '';
  }

  changeState(): void {
    if (this.newState === null) {
      this.errorMessage = 'الرجاء اختيار الحالة الجديدة';
      return;
    }

    if (!this.privateKey.trim()) {
      this.errorMessage = 'الرجاء إدخال المفتاح الخاص';
      return;
    }

    const currentState = this.systemInfo?.state?.state;
    if (currentState !== undefined && this.newState === currentState) {
      this.errorMessage = 'الحالة المختارة هي نفس الحالة الحالية';
      return;
    }

    const currentStateName = this.getStateName(currentState);
    const newStateName = this.getStateName(this.newState);
    
    const confirmChange = confirm(
      `هل أنت متأكد من تغيير حالة الانتخاب من "${currentStateName}" إلى "${newStateName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`
    );

    if (!confirmChange) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    // نحتاج لإضافة دالة changeState في service
    this.electionsService.changeState(this.newState).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = `تم تغيير الحالة إلى "${newStateName}" بنجاح`;
          this.transactionHash = response.transactionHash;
          this.privateKey = '';
          
          // تحديث معلومات النظام بعد التغيير
          setTimeout(() => this.loadSystemInfo(), 2000);
        } else {
          this.errorMessage = response.message || 'فشل في تغيير الحالة';
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error changing state:', error);
        this.errorMessage = error.error?.message || 'حدث خطأ في تغيير الحالة';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.newState = null;
    this.privateKey = '';
    this.errorMessage = '';
  }

  clearError(): void {
    this.errorMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}