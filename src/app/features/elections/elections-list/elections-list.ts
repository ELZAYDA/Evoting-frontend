import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Election } from '../models/election';
import { ElectionsService } from '../services/elections.service';

@Component({
  selector: 'app-election-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './elections-list.html',
  styleUrls: ['./elections-list.css']
})
export class ElectionsList implements OnInit {
  elections: Election[] = [];
  filteredElections: Election[] = [];
  selectedStatus: string = 'all';

  private readonly electionService = inject(ElectionsService);
  private readonly router = inject(Router);

  ngOnInit(): void {    
    this.getAllElections();
  }

  getAllElections() {
    this.electionService.getElections( ).subscribe({
      next: ({ data }) => {
        this.elections = data;
        this.filteredElections = [...this.elections];
      },
      error: (error) => {
        console.error('Error loading elections:', error);
      }
    });
  }

  // باقي الدوال كما هي...
  filterElections(status: string): void {
    this.selectedStatus = status;
    
    if (status === 'all') {
      this.filteredElections = [...this.elections];
    } else {
      const statusMap: { [key: string]: boolean } = {
        'active': true,
        'completed': false
      };
      
      this.filteredElections = this.elections.filter(election => 
        statusMap[status] === election.status
      );
    }
  }

  getStatusText(status: boolean): string {
    return status ? 'نشطة' : 'منتهية';
  }

  getStatusClass(status: boolean): string {
    return status ? 'status-active' : 'status-completed';
  }

  voteForElection(electionId: number): void {
    this.router.navigate(['/vote', electionId]);
  }

  viewResults(electionId: number): void {
    this.router.navigate(['/election', electionId, 'results']);
  }

  // viewCandidates(electionId: number): void {
  //   this.router.navigate([electionId,'/candidates-list']);
  // }

  canVote(election: Election): boolean {
    if (!election.status) return false;
    
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    return now >= startDate && now <= endDate;
  }

  getDaysRemaining(endDateStr: string): string {
    const today = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `متبقي ${diffDays} يوم`;
    } else if (diffDays === 0) {
      return 'ينتهي اليوم';
    } else {
      return 'منتهية';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}