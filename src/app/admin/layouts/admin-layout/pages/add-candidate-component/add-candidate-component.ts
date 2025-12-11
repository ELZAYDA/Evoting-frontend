import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectionsService, SystemInfo } from '../../../../../features/elections/services/elections.service';

interface CandidateData {
  name: string;
  party: string;
  age: number;
  qualification: string;
}

@Component({
  selector: 'app-add-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-candidate-component.html',
  styleUrls: ['./add-candidate-component.css']
})
export class AddCandidateComponent implements OnInit {
  candidate: CandidateData = {
    name: '',
    party: '',
    age: 21,
    qualification: ''
  };

  systemInfo: SystemInfo | null = null;
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
      next: (info) => {
        this.systemInfo = info;
      },
      error: (error) => {
        console.error('Error loading system info:', error);
        this.errorMessage = 'حدث خطأ في تحميل معلومات النظام';
      }
    });
  }

  getStateName(state: number): string {
    switch(state) {
      case 0: return 'مرحلة التسجيل';
      case 1: return 'مرحلة التصويت';
      case 2: return 'انتهى';
      default: return 'غير معروف';
    }
  }

  getStateIcon(state: number): string {
    switch(state) {
      case 0: return '📝';
      case 1: return '✅';
      case 2: return '⛔';
      default: return '❓';
    }
  }

  addCandidate(): void {
    if (!this.validateForm()) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.electionsService.addContestant(this.candidate).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = `تم إضافة المرشح "${this.candidate.name}" بنجاح`;
          this.transactionHash = response.transactionHash;
          this.resetForm();
        } else {
          this.errorMessage = response.message || 'فشل في إضافة المرشح';
        }
        this.isSubmitting = false;
      },
      error: (error: { error: { message: string; }; }) => {
        console.error('Error adding candidate:', error);
        this.errorMessage = error.error?.message || 'حدث خطأ في إضافة المرشح';
        this.isSubmitting = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.candidate.name.trim()) {
      this.errorMessage = 'يرجى إدخال اسم المرشح';
      return false;
    }
    
    if (!this.candidate.party.trim()) {
      this.errorMessage = 'يرجى إدخال اسم الحزب';
      return false;
    }
    
    if (this.candidate.age < 21) {
      this.errorMessage = 'يجب أن يكون عمر المرشح 21 سنة أو أكثر';
      return false;
    }
    
    if (!this.candidate.qualification.trim()) {
      this.errorMessage = 'يرجى إدخال المؤهل العلمي';
      return false;
    }

    return true;
  }

  resetForm(): void {
    this.candidate = {
      name: '',
      party: '',
      age: 21,
      qualification: ''
    };
  }

  addAnother(): void {
    this.successMessage = '';
    this.transactionHash = '';
  }

  clearError(): void {
    this.errorMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}