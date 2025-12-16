import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ElectionsService, Candidate, SystemInfo } from '../../../../../features/elections/services/elections.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  systemInfo: SystemInfo | null = null;
  candidates: Candidate[] = [];
  totalVotes = 0;
  lastUpdated = new Date();

  constructor(
    private router: Router,
    private electionsService: ElectionsService
  ) {}

  ngOnInit(): void {
    this.loadSystemInfo();
    this.loadCandidates();
  }

  loadSystemInfo(): void {
    this.electionsService.getSystemInfo().subscribe({
      next: (info) => {
        this.systemInfo = info;
        this.lastUpdated = new Date();
      },
      error: (error) => {
        console.error('Error loading system info:', error);
        alert('حدث خطأ في تحميل معلومات النظام');
      }
    });
  }

  loadCandidates(): void {
    this.electionsService.getContestants().subscribe({
      next: (candidates) => {
        this.candidates = candidates.sort((a, b) => b.voteCount - a.voteCount);
        this.calculateTotalVotes();
        this.lastUpdated = new Date();
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        this.candidates = [];
      }
    });
  }

  calculateTotalVotes(): void {
    this.totalVotes = this.candidates.reduce((total, candidate) => 
      total + candidate.voteCount, 0);
  }

  getTotalVotes(): number {
    return this.totalVotes || 1; // Avoid division by zero
  }

  getStateName(state: number): string {
    switch(state) {
      case 0: return 'مرحلة التسجيل';
      case 1: return 'مرحلة التصويت';
      case 2: return 'انتهى';
      default: return 'غير معروف';
    }
  }

  getStateClass(state: number): string {
    switch(state) {
      case 0: return 'registration';
      case 1: return 'voting';
      case 2: return 'ended';
      default: return '';
    }
  }

  getStatusText(state: number | undefined): string {
    if (state === undefined) return 'غير معروف';
    
    switch(state) {
      case 0: return 'التسجيل';
      case 1: return 'التصويت';
      case 2: return 'مكتمل';
      default: return 'غير معروف';
    }
  }

  getWinnerName(): string {
    if (this.candidates.length === 0) return 'لا يوجد';
    return this.candidates[0]?.name || 'لا يوجد';
  }

  getWinnerVotes(): number {
    if (this.candidates.length === 0) return 0;
    return this.candidates[0]?.voteCount || 0;
  }

  getAverageVotes(): number {
    if (this.candidates.length === 0) return 0;
    return Math.round(this.totalVotes / this.candidates.length);
  }

  goToAddCandidate(): void {
    this.router.navigate(['/admin/add-candidate']);
  }

  goToChangeState(): void {
    this.router.navigate(['/admin/change-state']);
  }

  viewUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  viewSettings(): void {
    this.router.navigate(['/admin/settings']);
  }

  refreshData(): void {
    this.loadSystemInfo();
    this.loadCandidates();
  }
   goBack(): void {
    this.router.navigate(['/home']);
  }
}