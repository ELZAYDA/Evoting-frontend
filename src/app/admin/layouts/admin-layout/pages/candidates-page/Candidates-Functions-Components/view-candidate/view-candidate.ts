// view-candidate.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Candidate } from '../../models/Candidate';
import { CandidatesService } from '../../../../../../services/candidates.service';

@Component({
  selector: 'app-view-candidate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-candidate.html',
  styleUrls: ['./view-candidate.css']
})
export class ViewCandidateComponent implements OnInit {
  candidate: Candidate | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  candidateId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidatesService: CandidatesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.candidateId = +params['id'];
      this.loadCandidate();
    });
  }

  loadCandidate(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.candidatesService.getCandidateById(this.candidateId).subscribe({
      next: (response: any) => {        
        // معالجة الاستجابة من API
        if (response) {
          this.candidate = response.data;
        } else {
          this.candidate = null;
          this.errorMessage = 'لم يتم العثور على بيانات المرشح';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading candidate:', error);
        this.errorMessage = 'فشل في تحميل بيانات المرشح. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
        this.candidate = null;
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/admin/candidates/edit', this.candidateId]);
  }

  onDelete(): void {
    if (!this.candidate) return;

    if (confirm(`هل أنت متأكد من حذف المرشح "${this.candidate.fullName}"؟`)) {
      this.candidatesService.deleteCandidate(this.candidateId).subscribe({
        next: () => {
          this.router.navigate(['/admin/candidates']);
        },
        error: (error) => {
          console.error('Error deleting candidate:', error);
          alert('فشل في حذف المرشح. يرجى المحاولة مرة أخرى.');
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/candidates']);
  }

  retryLoading(): void {
    this.loadCandidate();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  getVotePercentage(): number {
    if (!this.candidate || !this.candidate.votesCount) return 0;
    // هذه نسبة افتراضية - يمكن تعديلها حسب البيانات الفعلية
    return (this.candidate.votesCount / 1000) * 100;
  }

  getPartyText(): string {
    if (!this.candidate) return '';
    return this.candidate.party || 'مرشح مستقل';
  }
}