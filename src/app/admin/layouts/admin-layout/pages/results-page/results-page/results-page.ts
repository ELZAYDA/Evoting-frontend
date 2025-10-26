// results-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ElectionsService } from '../../../../../services/elections.service';
import { ResultsSummary, Winner, ElectionStatistics } from '../models/results';
import { ResultsService } from '../services/results.service';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './results-page.html',
  styleUrls: ['./results-page.css']
})
export class ResultsPage implements OnInit {
  electionId: number | null = null;
  electionFilter: string = '';
  elections: any[] = [];
  
  results: ResultsSummary | null = null;
  winner: Winner | null = null;
  statistics: ElectionStatistics | null = null;
  
  isLoading: boolean = false;
  isLoadingElections: boolean = true;
  errorMessage: string = '';

  activeTab: string = 'results';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultsService: ResultsService,
    private electionsService: ElectionsService
  ) {}

  ngOnInit(): void {
    this.loadElections();
    
    this.route.params.subscribe(params => {
      if (params['electionId']) {
        this.electionId = +params['electionId'];
        this.loadResults();
      }
    });
  }

  loadElections(): void {
    this.isLoadingElections = true;
    
    this.electionsService.getElections().subscribe({
      next: (response: any) => {
        if (response.data) {
          this.elections = response.data;
        } else if (Array.isArray(response)) {
          this.elections = response;
        } else {
          this.elections = [];
        }
        this.isLoadingElections = false;
      },
      error: (error) => {
        console.error('Error loading elections:', error);
        this.isLoadingElections = false;
      }
    });
  }

  onElectionChange(): void {
    if (this.electionFilter) {
      this.electionId = +this.electionFilter;
      this.router.navigate(['/admin/results', this.electionId]);
    }
  }

  loadResults(): void {
    if (!this.electionId) return;

    this.isLoading = true;
    this.errorMessage = '';

    // تحميل النتائج الكاملة
    this.resultsService.getResults(this.electionId).subscribe({
      next: (results) => {
        this.results = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.errorMessage = 'فشل في تحميل النتائج. تأكد من انتهاء الانتخاب.';
        this.isLoading = false;
      }
    });

    // تحميل الفائز
    this.resultsService.getWinner(this.electionId).subscribe({
      next: (winner) => {
        this.winner = winner;
      },
      error: (error) => {
        console.error('Error loading winner:', error);
      }
    });

    // تحميل الإحصائيات
    this.resultsService.getStatistics(this.electionId).subscribe({
      next: (statistics) => {
        this.statistics = statistics;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getMedalClass(rank: number): string {
    switch (rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return '';
    }
  }

  getMedalIcon(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🔸';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  retryLoading(): void {
    this.loadResults();
  }
}