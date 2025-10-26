// create-candidate.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Candidate } from '../../models/Candidate';
import { CandidatesService } from '../../../../../../services/candidates.service';
import { ElectionsService } from '../../../../../../services/elections.service';


@Component({
  selector: 'app-create-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-candidate.html',
  styleUrls: ['./create-candidate.css']
})
export class CreateCandidateComponent implements OnInit {
  candidate: Candidate = {
    candidateId: 0,
    fullName: '',
    party: '',
    biography: '',
    photoUrl: '',
    createdAt: new Date().toISOString(),
    electionId: 0,
    electionTitle: '',
    votesCount: 0
  };

  elections: any[] = [];
  isLoading: boolean = false;
  isElectionsLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private candidatesService: CandidatesService,
    private electionsService: ElectionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadElections();
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
        
        // تحديد أول انتخاب افتراضيًا إذا كان هناك انتخابات
        if (this.elections.length > 0 && !this.candidate.electionId) {
          this.candidate.electionId = this.elections[0].electionId;
          this.onElectionChange();
        }
      },
      error: (error) => {
        console.error('Error loading elections:', error);
        this.errorMessage = 'فشل في تحميل قائمة الانتخابات.';
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

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // تحضير البيانات للإرسال
    const candidateData = {
      fullName: this.candidate.fullName,
      party: this.candidate.party,
      biography: this.candidate.biography,
      photoUrl: this.candidate.photoUrl || 'https://placehold.co/200x200',
      electionId: this.candidate.electionId,
      votesCount: 0
    };

    this.candidatesService.createCandidate(candidateData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'تم إنشاء المرشح بنجاح';
        
        // الانتقال للقائمة بعد ثانيتين
        setTimeout(() => {
          this.router.navigate(['/admin/candidates']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating candidate:', error);
        this.errorMessage = 'فشل في إنشاء المرشح. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
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
    this.router.navigate(['/admin/candidates']);
  }

  onPhotoUrlChange(): void {
    // يمكن إضافة تحقق من صحة رابط الصورة هنا
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
}