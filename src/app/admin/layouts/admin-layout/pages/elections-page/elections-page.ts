import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Election } from './models/election';
import { ElectionsService } from '../../../../services/elections.service';

@Component({
  selector: 'app-elections',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './elections-page.html',
  styleUrl: './elections-page.css',
  providers: [ElectionsService]
})
export class ElectionsPage implements OnInit {
  elections: Election[] = [];
  filteredElections: Election[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private electionsService: ElectionsService // تصحيح اسم الـ service
  ) {}

  ngOnInit(): void {
    this.loadElections();
  }

  loadElections(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.electionsService.getElections().subscribe({
      next: (res) => {
        this.elections = res.data;
        this.filteredElections = [...this.elections];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading elections:', error);
        this.errorMessage = 'فشل في تحميل قائمة الانتخابات. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
        this.elections = [];
        this.filteredElections = [];
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.elections;

    if (this.searchTerm) {
      filtered = filtered.filter(election => 
        election.electionName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        election.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter) {
      if (this.statusFilter === 'active') {
        filtered = filtered.filter(election => election.status === true);
      } else if (this.statusFilter === 'inactive') {
        filtered = filtered.filter(election => election.status === false);
      }
    }

    this.filteredElections = filtered;
  }

  getStatusText(status: boolean): string {
    return status ? 'نشط' : 'غير نشط';
  }

  getStatusClass(status: boolean): string {
    return status ? 'status-badge active' : 'status-badge inactive';
  }

  // دالة مساعدة لتحويل الحالة من boolean إلى string للفلتر
  getStatusForFilter(status: boolean): string {
    return status ? 'active' : 'inactive';
  }

  createElection(): void {
    this.router.navigate(['/admin/elections/create']);
  }

  editElection(election: Election): void {
    this.router.navigate(['/admin/elections/edit', election.electionId]);
  }

  viewElection(election: Election): void {
    this.router.navigate(['/admin/elections', election.electionId]);
  }

  deleteElection(election: Election): void {
    if (confirm(`هل أنت متأكد من حذف الانتخاب "${election.electionName}"؟`)) {
      this.electionsService.deleteElection(election.electionId).subscribe({
        next: () => {
          this.elections = this.elections.filter(e => e.electionId !== election.electionId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting election:', error);
          alert('فشل في حذف الانتخاب. يرجى المحاولة مرة أخرى.');
        }
      });
    }
  }


  getTotalElections(): number {
    return this.elections.length;
  }

  getActiveElections(): number {
    return this.elections.filter(e => e.status === true).length;
  }

  getInactiveElections(): number {
    return this.elections.filter(e => e.status === false).length;
  }

  // Method to retry loading elections
  retryLoading(): void {
    this.loadElections();
  }

  // دالة مساعدة لتنسيق التاريخ
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
  }

  // دالة للتحقق مما إذا كان الانتخاب نشطًا حاليًا
  isElectionActive(election: Election): boolean {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    return election.status && now >= startDate && now <= endDate;
  }

  // دالة للتحقق مما إذا كان الانتخاب قادمًا
  isElectionUpcoming(election: Election): boolean {
    const now = new Date();
    const startDate = new Date(election.startDate);
    return election.status && now < startDate;
  }

  // دالة للتحقق مما إذا كان الانتخاب منتهيًا
  isElectionCompleted(election: Election): boolean {
    const now = new Date();
    const endDate = new Date(election.endDate);
    return election.status && now > endDate;
  }
}