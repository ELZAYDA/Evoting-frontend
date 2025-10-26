// view-election.component.ts (محدث)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Election } from '../../models/election';
import { ElectionsService } from '../../../../../../services/elections.service';

@Component({
  selector: 'app-view-election',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './view-election.html',
  styleUrls: ['./view-election.css']
})
export class ViewElectionComponent implements OnInit {
  election: Election | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  electionId!: number;

  // إحصائيات الانتخاب
  electionStats = {
    totalVotes: 0,
    votingPercentage: 0,
    leadingCandidate: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private electionsService: ElectionsService
  ) {}

  ngOnInit(): void {
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
        this.election = res.data;
        this.isLoading = false;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading election:', error);
        this.errorMessage = 'فشل في تحميل بيانات الانتخاب. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    if (!this.election) return;

    // هنا يمكنك إضافة منطق حساب الإحصائيات من الـ API
    this.electionStats = {
      totalVotes: 1250, // بيانات وهمية - استبدلها ببيانات حقيقية من الـ API
      votingPercentage: 65,
      leadingCandidate: 'المرشح أ'
    };
  }

  // الدالة المضافة لحساب مدة الانتخاب
  calculateElectionDuration(): number {
    if (!this.election) return 0;
    
    const startDate = new Date(this.election.startDate);
    const endDate = new Date(this.election.endDate);
    
    // حساب الفرق بالأيام
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff >= 0 ? daysDiff : 0;
  }

  getStatusText(status: boolean): string {
    return status ? 'نشط' : 'غير نشط';
  }

  getStatusClass(status: boolean): string {
    return status ? 'status-badge active' : 'status-badge inactive';
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

  isElectionActive(): boolean {
    if (!this.election) return false;
    const now = new Date();
    const startDate = new Date(this.election.startDate);
    const endDate = new Date(this.election.endDate);
    return this.election.status && now >= startDate && now <= endDate;
  }

  isElectionUpcoming(): boolean {
    if (!this.election) return false;
    const now = new Date();
    const startDate = new Date(this.election.startDate);
    return this.election.status && now < startDate;
  }

  isElectionCompleted(): boolean {
    if (!this.election) return false;
    const now = new Date();
    const endDate = new Date(this.election.endDate);
    return this.election.status && now > endDate;
  }

  getElectionStatus(): string {
    if (!this.election) return '';
    
    if (!this.election.status) return 'معطل';
    if (this.isElectionActive()) return 'جاري';
    if (this.isElectionUpcoming()) return 'قادم';
    if (this.isElectionCompleted()) return 'منتهي';
    
    return 'غير محدد';
  }

  onEdit(): void {
    this.router.navigate(['/admin/elections/edit', this.electionId]);
  }

  onDelete(): void {
    if (!this.election) return;

    if (confirm(`هل أنت متأكد من حذف الانتخاب "${this.election.electionName}"؟`)) {
      this.electionsService.deleteElection(this.electionId).subscribe({
        next: () => {
          this.router.navigate(['/admin/elections']);
        },
        error: (error) => {
          console.error('Error deleting election:', error);
          alert('فشل في حذف الانتخاب. يرجى المحاولة مرة أخرى.');
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/elections']);
  }

  retryLoading(): void {
    this.loadElection();
  }
}