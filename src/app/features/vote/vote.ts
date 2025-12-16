import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElectionsService, Candidate, VoteRequest, SystemInfo } from '../elections/services/elections.service';
import { WalletService } from '../elections/services/wallet.service';

@Component({
  selector: 'app-vote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vote.html',
  styleUrls: ['./vote.css']
})
export class VoteComponent implements OnInit, OnDestroy {
  // Candidates
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  
  // Voting state
  selectedCandidateId: number | null = null;
  voteSubmitted = false;
  isSubmitting = false;
  isRegistering = false;
  showPrivateKeyInput = false;
  
  // Input fields
  searchTerm = '';
  privateKey = '';
  totalVotes = 0;
  
  // Wallet state
  walletAddress: string | null = null;
  isWalletConnected = false;
  isVoterRegistered = false;
  hasVoted = false;
  
  // System state
  systemInfo: SystemInfo | null = null;
  isRegistrationPhase = false;
  isVotingPhase = false;
  isElectionEnded = false;
  
  // Services
  private readonly electionsService = inject(ElectionsService);
  private readonly walletService = inject(WalletService);
  private readonly router = inject(Router);
  
  // For cleanup
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeWallet();
    this.loadSystemInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load system info
  loadSystemInfo(): void {
    this.electionsService.getSystemInfo().subscribe({
      next: (info: SystemInfo) => {
        this.systemInfo = info;
        this.updateElectionState(info.state.state);
      },
      error: (error) => {
        console.error('Error loading system info:', error);
        this.showMessage('error', 'Error loading system information');
      }
    });
  }

  // Update election state based on state number
  updateElectionState(state: number): void {
    this.isRegistrationPhase = state === 0;     // 0 = Registration
    this.isVotingPhase = state === 1;           // 1 = Voting
    this.isElectionEnded = state === 2;         // 2 = Ended
    
    // Load candidates only in voting or ended phase
    if (this.isVotingPhase || this.isElectionEnded) {
      this.loadCandidates();
    }
  }

  // Get state description
  getStateDescription(state: number): string {
    switch (state) {
      case 0: return 'Registration Phase';
      case 1: return 'Voting Phase';
      case 2: return 'Election Ended';
      default: return 'Unknown';
    }
  }

  // Initialize wallet connection
  async initializeWallet(): Promise<void> {
    if (!this.walletService.isMetaMaskInstalled()) {
      this.showMetaMaskInstallPrompt();
      return;
    }
    
    await this.connectWallet();
  }

  // Connect to MetaMask
  async connectWallet(): Promise<void> {
    try {
      this.walletAddress = await this.walletService.connectMetaMask();
      this.isWalletConnected = !!this.walletAddress;
      
      if (this.walletAddress) {
        await this.checkVoterStatus();
      }
    } catch (error) {
      this.showMessage('error', 'Failed to connect wallet');
    }
  }

  // Check voter status
  async checkVoterStatus(): Promise<void> {
    if (!this.walletAddress) return;

    this.electionsService.checkVoterStatus(this.walletAddress).subscribe({
      next: (response: any) => {
        this.isVoterRegistered = response?.isRegistered || false;
        this.hasVoted = response?.hasVoted || false;
        
        if (!response?.isValidAddress) {
          this.showMessage('error', 'Invalid wallet address');
        }
      },
      error: (error) => {
        console.error('Error checking voter status:', error);
        this.showMessage('error', 'Error checking voter status');
      }
    });
  }

  // Register voter
  registerVoter(): void {
    if (!this.walletAddress) return;

    // Check if we're in registration phase
    if (!this.isRegistrationPhase) {
      this.showMessage('error', 'Registration is not open at this time');
      return;
    }

    this.isRegistering = true;

    this.electionsService.registerVoter(this.walletAddress).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.isVoterRegistered = true;
          this.showMessage('success', 'Successfully registered as voter!');
          this.checkVoterStatus(); // Refresh status
        } else {
          this.showMessage('error', response.message || 'Registration failed');
        }
        this.isRegistering = false;
      },
      error: (error) => {
        console.error('Error registering voter:', error);
        this.showMessage('error', error.error?.message || 'Failed to register voter');
        this.isRegistering = false;
      }
    });
  }

  // Load candidates
  loadCandidates(): void {
    this.electionsService.getContestants().subscribe({
      next: (candidates: Candidate[]) => {
        this.candidates = candidates;
        this.filteredCandidates = [...this.candidates];
        this.calculateTotalVotes();
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        this.showMessage('error', 'Error loading candidates');
      }
    });
  }

  // Select candidate
  selectCandidate(candidateId: number): void {
    // Validation
    if (!this.isVotingPhase) {
      this.showMessage('error', 'Voting is not active at this time');
      return;
    }

    if (!this.isVoterRegistered) {
      this.showMessage('error', 'You must be registered to vote');
      return;
    }

    if (this.hasVoted) {
      this.showMessage('error', 'You have already voted!');
      return;
    }

    if (!this.isWalletConnected) {
      this.showMessage('error', 'Please connect wallet first');
      return;
    }

    this.selectedCandidateId = candidateId;
    this.candidates.forEach(c => c.selected = c.id === candidateId);
  }

  // Toggle private key input
  togglePrivateKeyInput(): void {
    if (!this.isVotingPhase) return;
    
    this.showPrivateKeyInput = !this.showPrivateKeyInput;
    if (!this.showPrivateKeyInput) {
      this.privateKey = '';
    }
  }

  // Submit vote
  submitVote(): void {
    // Validation checks
    if (!this.selectedCandidateId) {
      this.showMessage('error', 'Please select a candidate');
      return;
    }

    if (!this.walletAddress) {
      this.showMessage('error', 'Please connect wallet first');
      return;
    }

    if (!this.isVoterRegistered) {
      this.showMessage('error', 'You must be registered to vote');
      return;
    }

    if (this.hasVoted) {
      this.showMessage('error', 'You have already voted!');
      return;
    }

    if (!this.isVotingPhase) {
      this.showMessage('error', 'Voting is not active at this time');
      return;
    }

    if (!this.privateKey.trim()) {
      this.showMessage('error', 'Please enter your private key');
      this.showPrivateKeyInput = true;
      return;
    }

    // Confirmation dialog
    const candidateName = this.getSelectedCandidateName();
    const confirmVote = confirm(`Are you sure you want to vote for ${candidateName}?\n\nThis action cannot be undone.`);
    
    if (!confirmVote) return;

    this.isSubmitting = true;

    const voteRequest: VoteRequest = {
      contestantId: this.selectedCandidateId,
      privateKey: this.privateKey.trim()
    };

    this.electionsService.voteForCandidate(voteRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.voteSubmitted = true;
            this.hasVoted = true;
            this.showMessage('success', `✅ Vote submitted successfully!`);
            
            // Clear sensitive data
            this.privateKey = '';
            this.showPrivateKeyInput = false;
            
            // Refresh candidates and status
            setTimeout(() => {
              this.loadCandidates();
              this.checkVoterStatus();
            }, 2000);
          } else {
            this.showMessage('error', response.message || 'Failed to submit vote');
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error submitting vote:', error);
          this.showMessage('error', error.error?.message || 'Error submitting vote');
          this.isSubmitting = false;
        }
      });
  }

  // Search candidates
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filterCandidates();
  }

  // Filter candidates
  filterCandidates(): void {
    if (!this.searchTerm) {
      this.filteredCandidates = [...this.candidates];
      return;
    }

    this.filteredCandidates = this.candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(this.searchTerm) ||
      candidate.party.toLowerCase().includes(this.searchTerm)
    );
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredCandidates = [...this.candidates];
  }

  // View results
  viewResults(): void {
    this.router.navigate(['/elections']);
  }

  // Back to elections
  backToElections(): void {
    this.router.navigate(['/elections']);
  }

  // Calculate total votes
  calculateTotalVotes(): void {
    this.totalVotes = this.candidates.reduce((total, candidate) => total + candidate.voteCount, 0);
    
    // Calculate percentage for each candidate
    this.candidates.forEach(candidate => {
      candidate.percentage = this.totalVotes > 0 
        ? Number(((candidate.voteCount / this.totalVotes) * 100).toFixed(1))
        : 0;
    });
  }

  // Get selected candidate name
  getSelectedCandidateName(): string {
    const candidate = this.candidates.find(c => c.id === this.selectedCandidateId);
    return candidate ? candidate.name : '';
  }

  // Show message
  showMessage(type: string, message: string): void {
    alert(message);
  }

  // Show MetaMask install prompt
  showMetaMaskInstallPrompt(): void {
    const install = confirm('MetaMask is not installed. Would you like to install it now?');
    if (install) {
      window.open('https://metamask.io/download/', '_blank');
    }
  }

  // Get candidate avatar color
  getAvatarColor(id: number): string {
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
    return colors[id % colors.length];
  }
}