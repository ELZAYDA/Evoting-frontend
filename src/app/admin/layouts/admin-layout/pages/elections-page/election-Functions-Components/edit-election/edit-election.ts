// edit-election.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Election } from '../../models/election';
import { ElectionsService } from '../../../../../../services/elections.service';


@Component({
  selector: 'app-edit-election',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-election.html',
  styleUrls: ['./edit-election.css']
})
export class EditElectionComponent implements OnInit {
  election: Election = {
    electionId: 0,
    electionName: '',
    description: '',
    startDate: '',
    endDate: '',
    status: false,
    createdAt: '',
    candidatesCount: 0
  };

  originalElection: Election | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  electionId!: number;
  minDate: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private electionsService: ElectionsService
  ) {}

  ngOnInit(): void {
    this.minDate = new Date().toISOString().split('T')[0];
    
    this.route.params.subscribe(params => {
      this.electionId = +params['id'];
      this.loadElection();
    });
  }

  loadElection(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.electionsService.getElectionById(this.electionId).subscribe({
      next: (res) => {
        this.election = { ...res.data };
        this.originalElection = { ...res.data };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading election:', error);
        this.errorMessage = 'فشل في تحميل بيانات الانتخاب. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.electionsService.updateElection(this.electionId, this.election).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.successMessage = 'تم تحديث الانتخاب بنجاح';
        
        // الانتقال للقائمة بعد ثانيتين
        setTimeout(() => {
          this.router.navigate(['/admin/elections']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating election:', error);
        this.errorMessage = 'فشل في تحديث الانتخاب. يرجى المحاولة مرة أخرى.';
        this.isSaving = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.election.electionName?.trim()) {
      this.errorMessage = 'اسم الانتخاب مطلوب';
      return false;
    }

    if (!this.election.startDate) {
      this.errorMessage = 'تاريخ البدء مطلوب';
      return false;
    }

    if (!this.election.endDate) {
      this.errorMessage = 'تاريخ الانتهاء مطلوب';
      return false;
    }

    const startDate = new Date(this.election.startDate);
    const endDate = new Date(this.election.endDate);
    const today = new Date();

    if (this.originalElection && new Date(this.originalElection.startDate) > today) {
      // إذا الانتخاب لم يبدأ بعد، يمكن تغيير تاريخ البدء
      if (startDate < today) {
        this.errorMessage = 'تاريخ البدء يجب أن يكون في المستقبل';
        return false;
      }
    }

    if (endDate <= startDate) {
      this.errorMessage = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  onCancel(): void {
    if (this.hasChanges()) {
      if (confirm('هل تريد تجاهل التغييرات؟')) {
        this.router.navigate(['/admin/elections']);
      }
    } else {
      this.router.navigate(['/admin/elections']);
    }
  }

  hasChanges(): boolean {
    if (!this.originalElection) return false;
    
    return (
      this.election.electionName !== this.originalElection.electionName ||
      this.election.description !== this.originalElection.description ||
      this.election.startDate !== this.originalElection.startDate ||
      this.election.endDate !== this.originalElection.endDate ||
      this.election.status !== this.originalElection.status
    );
  }

  resetForm(): void {
    if (this.originalElection) {
      this.election = { ...this.originalElection };
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  calculateDuration(): number {
    if (!this.election.startDate || !this.election.endDate) return 0;
    
    const startDate = new Date(this.election.startDate);
    const endDate = new Date(this.election.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff >= 0 ? daysDiff : 0;
  }

  onStartDateChange(): void {
    if (this.election.startDate && this.election.endDate) {
      const startDate = new Date(this.election.startDate);
      const endDate = new Date(this.election.endDate);
      
      if (endDate <= startDate) {
        // تعديل تاريخ الانتهاء تلقائياً
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        this.election.endDate = newEndDate.toISOString().split('T')[0];
      }
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG');
    } catch {
      return dateString;
    }
  }

  retryLoading(): void {
    this.loadElection();
  }
}