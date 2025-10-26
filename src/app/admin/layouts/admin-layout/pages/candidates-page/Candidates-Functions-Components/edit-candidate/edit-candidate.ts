// edit-candidate.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Candidate } from '../../models/Candidate';
import { CandidatesService } from '../../../../../../services/candidates.service';
import { ElectionsService } from '../../../../../../services/elections.service';


@Component({
  selector: 'app-edit-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-candidate.html',
  styleUrls: ['./edit-candidate.css']
})
export class EditCandidateComponent implements OnInit {
  candidate: Candidate = {
    candidateId: 0,
    fullName: '',
    party: '',
    biography: '',
    photoUrl: '',
    createdAt: '',
    electionId: 0,
    electionTitle: '',
    votesCount: 0
  };

  originalCandidate: Candidate | null = null;
  elections: any[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;
  isElectionsLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  candidateId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidatesService: CandidatesService,
    private electionsService: ElectionsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.candidateId = +params['id'];
      this.loadCandidate();
      this.loadElections();
    });
  }

  loadCandidate(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.candidatesService.getCandidateById(this.candidateId).subscribe({
      next: (response: any) => {
        console.log('Candidate data loaded:', response);
        
        if (response) {
          this.candidate = { ...response.data };
          this.originalCandidate = { ...response.data };
        } else {
          this.errorMessage = 'لم يتم العثور على بيانات المرشح';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading candidate:', error);
        this.errorMessage = 'فشل في تحميل بيانات المرشح. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
      }
    });
  }

  loadElections(): void {
    this.isElectionsLoading = true;
    
    this.electionsService.getElections().subscribe({
      next: (response: any) => {
        // معالجة الاستجابة من API
        if (response.data) {
          this.elections = response.data;
        } else if (Array.isArray(response)) {
          this.elections = response;
        } else {
          this.elections = [];
        }
        
        this.isElectionsLoading = false;
      },
      error: (error) => {
        console.error('Error loading elections:', error);
        this.isElectionsLoading = false;
      }
    });
  }

  onElectionChange(): void {
    const selectedElection = this.elections.find(e => e.electionId === this.candidate.electionId);
    if (selectedElection) {
      this.candidate.electionTitle = selectedElection.electionName || selectedElection.title;
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // تحضير البيانات للإرسال حسب ما يتوقعه الـ API
    const candidateData = {
      fullName: this.candidate.fullName,
      party: this.candidate.party,
      biography: this.candidate.biography,
      photoUrl: this.candidate.photoUrl,
      electionId: this.candidate.electionId
    };

    console.log('Sending update data:', candidateData);

    this.candidatesService.updateCandidate(this.candidateId, candidateData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.successMessage = 'تم تحديث بيانات المرشح بنجاح';
        
        // تحديث البيانات الأصلية
        this.originalCandidate = { ...this.candidate };
        
        // الانتقال للقائمة بعد ثانيتين
        setTimeout(() => {
          this.router.navigate(['/admin/candidates']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating candidate:', error);
        this.errorMessage = 'فشل في تحديث بيانات المرشح. يرجى المحاولة مرة أخرى.';
        this.isSaving = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.candidate.fullName?.trim()) {
      this.errorMessage = 'اسم المرشح مطلوب';
      return false;
    }

    if (!this.candidate.electionId) {
      this.errorMessage = 'يجب اختيار الانتخاب';
      return false;
    }

    if (this.candidate.party && this.candidate.party.trim().length < 2) {
      this.errorMessage = 'اسم الحزب يجب أن يكون على الأقل حرفين';
      return false;
    }

    if (this.candidate.biography && this.candidate.biography.trim().length < 10) {
      this.errorMessage = 'الوصف يجب أن يكون على الأقل 10 أحرف';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  onCancel(): void {
    if (this.hasChanges()) {
      if (confirm('هل تريد تجاهل التغييرات؟')) {
        this.router.navigate(['/admin/candidates']);
      }
    } else {
      this.router.navigate(['/admin/candidates']);
    }
  }

  resetForm(): void {
    if (this.originalCandidate) {
      this.candidate = { ...this.originalCandidate };
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  hasChanges(): boolean {
    if (!this.originalCandidate) return false;
    
    return (
      this.candidate.fullName !== this.originalCandidate.fullName ||
      this.candidate.party !== this.originalCandidate.party ||
      this.candidate.biography !== this.originalCandidate.biography ||
      this.candidate.photoUrl !== this.originalCandidate.photoUrl ||
      this.candidate.electionId !== this.originalCandidate.electionId
    );
  }

  onPhotoUrlChange(): void {
    if (this.candidate.photoUrl && !this.isValidUrl(this.candidate.photoUrl)) {
      this.errorMessage = 'رابط الصورة غير صحيح';
    } else {
      this.errorMessage = '';
    }
  }

  isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  useDefaultPhoto(): void {
    this.candidate.photoUrl = 'https://placehold.co/200x200';
    this.errorMessage = '';
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
    this.loadCandidate();
  }
}