import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Election } from '../models/election';
import { ElectionsService, ElectionResults, SystemInfo } from '../services/elections.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-elections-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './elections-list.html',
  styleUrls: ['./elections-list.css']
})
export class ElectionsListComponent implements OnInit {
  // Main election
  mainElection: Election | null = null;
  
  // System info
  systemInfo: SystemInfo | null = null;
  
  // Election state (0, 1, 2)
  electionState: number = 0;
  
  // Wallet and voter state
  walletAddress: string | null = null;
  isWalletConnected = false;
  isVoterRegistered = false;
  isCheckingVoterStatus = false;
  
  // Filtered elections
  filteredElections: Election[] = [];
  
  // Candidates and results data
  candidates: any[] = [];
  totalVotes: number = 0;
  winner: any = null;
  
  // Loading state
  isLoading: boolean = true;

  private readonly electionService = inject(ElectionsService);
  private readonly walletService = inject(WalletService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {    
    await this.checkWalletConnection();
    this.loadElectionData();
  }

  // Check wallet connection
  async checkWalletConnection(): Promise<void> {
    try {
      const account = await this.walletService.getConnectedAccount();
      if (account) {
        this.walletAddress = account;
        this.isWalletConnected = true;
        await this.checkVoterStatus();
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }

  // Connect wallet
  async connectWallet(): Promise<void> {
    try {
      this.walletAddress = await this.walletService.connectMetaMask();
      this.isWalletConnected = !!this.walletAddress;
      
      if (this.walletAddress) {
        await this.checkVoterStatus();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
    }
  }

  // Check voter status
  async checkVoterStatus(): Promise<void> {
    if (!this.walletAddress) return;

    this.isCheckingVoterStatus = true;
    
    try {
      const response = await this.electionService.checkVoterStatus(this.walletAddress).toPromise();
      this.isVoterRegistered = response?.isRegistered || false;
    } catch (error) {
      console.error('Error checking voter status:', error);
    } finally {
      this.isCheckingVoterStatus = false;
    }
  }

  loadElectionData() {
    this.isLoading = true;
    
    // First get system info to determine state
    this.electionService.getSystemInfo().subscribe({
      next: (info: SystemInfo) => {
        this.systemInfo = info;
        this.electionState = info.state.state;
        
        // Then get election data
        this.electionService.getElectionData().subscribe({
          next: (election: Election) => {
            this.mainElection = { ...election, state: info.state.state };
            
            // Always load results (regardless of state)
            this.loadElectionResults();
          },
          error: (error) => {
            console.error('Error loading election data:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading system info:', error);
        this.isLoading = false;
      }
    });
  }

  loadElectionResults() {
    this.electionService.getElections().subscribe({
      next: (results: ElectionResults) => {
        this.candidates = results.results || [];
        this.winner = results.winner;
        this.calculateTotalVotes();
        
        this.filteredElections = this.mainElection ? [this.mainElection] : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading election results:', error);
        this.isLoading = false;
      }
    });
  }

  // Calculate total votes
  calculateTotalVotes(): void {
    this.totalVotes = this.candidates.reduce((total, candidate) => total + candidate.voteCount, 0);
    
    // Calculate percentage for each candidate
    this.candidates.forEach(candidate => {
      candidate.percentage = this.totalVotes > 0 
        ? ((candidate.voteCount / this.totalVotes) * 100).toFixed(1)
        : 0;
    });
  }

  // Updated methods for three states
  getStatusText(state: number): string {
    switch(state) {
      case 0: return 'Registration';
      case 1: return 'Voting';
      case 2: return 'Results';
      default: return 'Unknown';
    }
  }

  getStatusClass(state: number): string {
    switch(state) {
      case 0: return 'status-registration';
      case 1: return 'status-voting';
      case 2: return 'status-results';
      default: return 'status-unknown';
    }
  }

  getStateText(state: number): string {
    switch(state) {
      case 0: return 'Registration Phase';
      case 1: return 'Voting Active';
      case 2: return 'Results Available';
      default: return 'Unknown State';
    }
  }

  getStateDescription(state: number): string {
    switch(state) {
      case 0: return 'Registration is open. You can register to vote.';
      case 1: return 'Voting is active. Registered voters can cast their votes.';
      case 2: return 'Voting has ended. View the election results.';
      default: return 'Unknown system state.';
    }
  }

  // Navigate to registration page
  goToRegistration(): void {
    this.router.navigate(['/registeration']);
  }

  // Navigate to vote page
  goToVote(): void {
    this.router.navigate(['/vote']);
  }

  // View results in the same page
  viewResults(): void {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // View candidates (always available)
  viewCandidates(): void {
    this.viewResults();
  }

  // Format wallet address
  formatWalletAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Get registration button text
  getRegisterButtonText(): string {
    if (this.isCheckingVoterStatus) return 'Checking...';
    if (this.isVoterRegistered) return 'Already Registered';
    return 'Register to Vote';
  }

  // Get vote button text
  getVoteButtonText(): string {
    if (this.isCheckingVoterStatus) return 'Checking...';
    if (!this.isVoterRegistered) return 'Not Registered';
    return 'Vote Now';
  }

  // Check if register button should be disabled
  isRegisterButtonDisabled(): boolean {
    return this.isCheckingVoterStatus || this.isVoterRegistered;
  }

  // Check if vote button should be disabled
  isVoteButtonDisabled(): boolean {
    return this.isCheckingVoterStatus || !this.isVoterRegistered;
  }

  // Get register button class
  getRegisterButtonClass(): string {
    if (this.isCheckingVoterStatus) return 'btn-checking';
    if (this.isVoterRegistered) return 'btn-registered';
    return 'btn-register';
  }

  // Get vote button class
  getVoteButtonClass(): string {
    if (this.isCheckingVoterStatus) return 'btn-checking';
    if (!this.isVoterRegistered) return 'btn-not-registered';
    return 'btn-vote';
  }

  getDaysRemaining(endDateStr: string): string {
    const today = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days remaining`;
    } else if (diffDays === 0) {
      return 'Ends today';
    } else {
      return 'Ended';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get color based on rank
  getRankColor(index: number): string {
    if (index === 0) return '#FFD700'; // Gold for winner
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#4CAF50'; // Green for others
  }

  // Get medal icon based on rank
  getMedalIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏅';
  }
}