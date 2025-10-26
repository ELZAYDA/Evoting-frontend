// candidates-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Candidate } from './models/Candidate';
import { CandidatesService } from '../../../../services/candidates.service';

@Component({
  selector: 'app-candidates-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './candidates-page.html',
  styleUrls: ['./candidates-page.css']
})
export class CandidatesPage implements OnInit {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  searchTerm: string = '';
  electionFilter: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  // قائمة الانتخابات للفلترة (يمكن جلبها من API إذا needed)
  elections: any[] = [];

  constructor(
    private router: Router,
    private candidatesService: CandidatesService
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.candidatesService.getCandidates().subscribe({
      next: (response: any) => {
        // إذا كان الـ API يرجع بيانات مغلفة
        if (response.data) {
          this.candidates = response.data;
        } else if (Array.isArray(response)) {
          this.candidates = response;
        } else {
          this.candidates = [];
        }
        
        this.filteredCandidates = [...this.candidates];
        this.extractElectionsFromCandidates();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        this.errorMessage = 'فشل في تحميل قائمة المرشحين. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
        this.candidates = [];
        this.filteredCandidates = [];
      }
    });
  }

  extractElectionsFromCandidates(): void {
    const electionMap = new Map();
    
    this.candidates.forEach(candidate => {
      if (candidate.electionId && candidate.electionTitle) {
        electionMap.set(candidate.electionId, {
          id: candidate.electionId,
          title: candidate.electionTitle
        });
      }
    });
    
    this.elections = Array.from(electionMap.values());
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onElectionFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.candidates;

    // تطبيق البحث
    if (this.searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.party?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.biography?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // تطبيق فلتر الانتخاب
    if (this.electionFilter) {
      filtered = filtered.filter(candidate => candidate.electionId === +this.electionFilter);
    }

    this.filteredCandidates = filtered;
  }

  getVotesPercentage(candidate: Candidate): number {
    const totalVotes = this.candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0);
    return totalVotes > 0 ? ((candidate.votesCount || 0) / totalVotes) * 100 : 0;
  }

  createCandidate(): void {
    this.router.navigate(['/admin/candidates/create']);
  }

  editCandidate(candidate: Candidate): void {
    this.router.navigate(['/admin/candidates/edit', candidate.candidateId]);
  }

  viewCandidate(candidate: Candidate): void {
    this.router.navigate(['/admin/candidates', candidate.candidateId]);
  }

  deleteCandidate(candidate: Candidate): void {
    if (confirm(`هل أنت متأكد من حذف المرشح "${candidate.fullName}"؟`)) {
      this.candidatesService.deleteCandidate(candidate.candidateId).subscribe({
        next: () => {
          // Remove from local array after successful API call
          this.candidates = this.candidates.filter(c => c.candidateId !== candidate.candidateId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting candidate:', error);
          alert('فشل في حذف المرشح. يرجى المحاولة مرة أخرى.');
        }
      });
    }
  }

  getTotalCandidates(): number {
    return this.candidates.length;
  }

  getTotalVotes(): number {
    return this.candidates.reduce((sum, candidate) => sum + (candidate.votesCount || 0), 0);
  }

  getLeadingCandidate(): Candidate | null {
    if (this.candidates.length === 0) return null;
    return this.candidates.reduce((leading, candidate) => 
      (candidate.votesCount || 0) > (leading.votesCount || 0) ? candidate : leading
    );
  }

  // Method to retry loading candidates
  retryLoading(): void {
    this.loadCandidates();
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
}