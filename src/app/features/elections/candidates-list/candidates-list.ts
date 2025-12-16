// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { ElectionsService } from '../services/elections.service';
// import { Candidate } from '../models/candidate';
// import { VoterService } from '../../voting/voter-check/service/voter.service';

// @Component({
//   selector: 'app-candidate-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//     templateUrl: './candidates-list.html',
//   styleUrls: ['./candidates-list.css']
// })
// export class CandidateListComponent implements OnInit {
//   candidates: Candidate[] = [];
//   filteredCandidates: Candidate[] = [];
//   searchTerm: string = '';
//   selectedElection: string = 'all';
//   elections: string[] = ['all'];
//   sortBy: string = 'name';
//   selectedCandidate: number | null = null;
//   isSubmitting: boolean = false;
//   voteSubmitted: boolean = false;
//   electionTitle: string = '';
//   electionDescription: string = '';

//   private readonly voteService = inject(VoterService);
//   private readonly electionService = inject(ElectionsService);
//   private readonly activatedRoute = inject(ActivatedRoute);
//   private readonly router = inject(Router);
//   electionId!: number;

//   ngOnInit(): void {
//     this.getElectionId();
//   }

//   getElectionId(): void {
//     this.activatedRoute.paramMap.subscribe({
//       next: (urlData) => {
//         this.electionId = Number(urlData.get('id') ?? 0);
//         if (this.electionId) {
//           this.getElectionCandidates(this.electionId);
//         }
//       }
//     });
//   }

//   getElectionCandidates(id: number): void {
//     this.electionService.getElectionCandidates(id).subscribe({
//       next: ({ data }) => {
//         this.candidates = data;
//         this.filteredCandidates = [...this.candidates];
        
//         // تعيين معلومات الانتخابات
//         if (this.candidates.length > 0) {
//           this.electionTitle = this.candidates[0].electionTitle;
//           this.electionDescription = `انتخابات ${this.electionTitle} - اختر المرشح المفضل لديك`;
//         }
        
//         // استخراج أنواع الانتخابات الفريدة من البيانات
//         const uniqueElections = [...new Set(this.candidates.map(c => c.electionTitle))];
//         this.elections = ['all', ...uniqueElections];
        
//         this.sortCandidates();
//       },
//       error: (error) => {
//         console.error('Error loading Candidates:', error);
//       }
//     });
//   }

//   // اختيار مرشح
//   selectCandidate(candidateId: number): void {
//     if (this.voteSubmitted) return;
//     this.selectedCandidate = this.selectedCandidate === candidateId ? null : candidateId;
//   }

//   // إرسال التصويت
//  submitVote(): void {
//   if (!this.selectedCandidate || this.isSubmitting) return;

//   this.isSubmitting = true;

//   // جلب voterId من الـ localStorage
//   const voterId = Number(sessionStorage.getItem('voterId'));
//   if (!voterId) {
//     alert('يجب التحقق من الرقم القومي قبل التصويت');
//     this.isSubmitting = false;
//     return;
//   }

//   this.voteService.castVote(voterId, this.selectedCandidate, this.electionId).subscribe({
//     next: (res) => {
//       console.log('Vote successful:', res);
//       this.voteSubmitted = true;
//       this.isSubmitting = false;
//     },
//     error: (err) => {
//       console.error('Vote error:', err);
//       this.isSubmitting = false;
//       alert('حدث خطأ أثناء تسجيل التصويت');
//     }
//   });
// }


//   // عرض النتائج
//   viewResults(): void {
//     this.router.navigate(['/elections', this.electionId, 'results']);
//   }

//   // العودة للانتخابات
//   backToElections(): void {
//     this.router.navigate(['/elections']);
//   }

//   // دالة trackBy لتحسين أداء ngFor
//   trackByCandidateId(index: number, candidate: Candidate): number {
//     return candidate.candidateId;
//   }

//   filterCandidates(): void {
//     this.filteredCandidates = this.candidates.filter(candidate => {
//       const matchesSearch = this.searchTerm === '' || 
//         candidate.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//         candidate.party.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//         candidate.electionTitle.toLowerCase().includes(this.searchTerm.toLowerCase());
      
//       const matchesElection = this.selectedElection === 'all' || candidate.electionTitle === this.selectedElection;
      
//       return matchesSearch && matchesElection;
//     });

//     this.sortCandidates();
//   }

//   sortCandidates(): void {
//     if (this.sortBy === 'name') {
//       this.filteredCandidates.sort((a, b) => a.fullName.localeCompare(b.fullName));
//     } else if (this.sortBy === 'votes') {
//       this.filteredCandidates.sort((a, b) => b.votesCount - a.votesCount);
//     }
//   }

//   onSearchChange(event: any): void {
//     this.searchTerm = event.target.value;
//     this.filterCandidates();
//   }

//   onElectionChange(event: any): void {
//     this.selectedElection = event.target.value;
//     this.filterCandidates();
//   }

//   onSortChange(event: any): void {
//     this.sortBy = event.target.value;
//     this.sortCandidates();
//   }

//   // حساب النسبة المئوية للأصوات
//   calculatePercentage(votesCount: number): number {
//     const totalVotes = this.getTotalVotes();
//     if (totalVotes === 0) return 0;
//     return Math.round((votesCount / totalVotes) * 100);
//   }

//   getActiveCandidatesCount(): number {
//     return this.filteredCandidates.length;
//   }

//   getTotalVotes(): number {
//     return this.filteredCandidates.reduce((total, candidate) => total + candidate.votesCount, 0);
//   }

//   // مسح الفلاتر
//   clearFilters(): void {
//     this.searchTerm = '';
//     this.selectedElection = 'all';
//     this.filterCandidates();
//   }
// }