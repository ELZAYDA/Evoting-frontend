import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../elections/services/wallet.service';
import { ElectionsService } from '../elections/services/elections.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registeration.html',
  styleUrls: ['./registeration.css']
})
export class RegistrationComponent implements OnInit {
  // Wallet state
  walletAddress: string | null = null;
  isWalletConnected = false;
  isMetaMaskInstalled = false;
  
  // Registration state
  isRegistering = false;
  registrationSuccess = false;
  registrationError = '';
  registrationMessage = '';
  
  // Voter status
  isVoterRegistered = false;
  voterHasVoted = false;
  voterStatus: any = null;
  isCheckingStatus = false;
  
  // System state
  systemInfo: any = null;
  electionState: number = 0;
  
  // Services
  private readonly walletService = inject(WalletService);
  private readonly electionsService = inject(ElectionsService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.checkMetaMask();
    this.loadSystemInfo();
  }

  // Check if MetaMask is installed
  checkMetaMask(): void {
    this.isMetaMaskInstalled = this.walletService.isMetaMaskInstalled();
    
    if (this.isMetaMaskInstalled) {
      this.checkWalletConnection();
    }
  }

  // Check existing wallet connection
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

  // Connect to MetaMask
  async connectWallet(): Promise<void> {
    try {
      if (!this.isMetaMaskInstalled) {
        this.showMetaMaskInstallPrompt();
        return;
      }

      this.walletAddress = await this.walletService.connectMetaMask();
      this.isWalletConnected = !!this.walletAddress;
      
      if (this.walletAddress) {
        await this.checkVoterStatus();
      }
    } catch (error: any) {
      this.showError('Failed to connect wallet: ' + error.message);
    }
  }

  // Load system info
  loadSystemInfo(): void {
    this.electionsService.getSystemInfo().subscribe({
      next: (info: any) => {
        this.systemInfo = info;
        this.electionState = info.state.state;
        
        // Check if registration is allowed (state 0)
        if (info.state.state !== 0) {
          this.showError(`Registration is not allowed. Current state: ${info.state.stateName}`);
        }
      },
      error: (error) => {
        console.error('Error loading system info:', error);
        this.showError('Error loading system information');
      }
    });
  }

  // Check voter status
  async checkVoterStatus(): Promise<void> {
    if (!this.walletAddress) return;

    this.isCheckingStatus = true;
    
    try {
      const response = await this.electionsService.checkVoterStatus(this.walletAddress).toPromise();
      this.voterStatus = response;
      
      // Update registration status
      this.isVoterRegistered = response?.isRegistered || false;
      this.voterHasVoted = response?.hasVoted || false;
      
      console.log('Voter Status:', this.voterStatus);
      console.log('Is Registered:', this.isVoterRegistered);
      console.log('Has Voted:', this.voterHasVoted);
      
      if (this.isVoterRegistered) {
        this.showSuccess('You are already registered as a voter!');
      }
    } catch (error) {
      console.error('Error checking voter status:', error);
      // Don't show error for initial check
    } finally {
      this.isCheckingStatus = false;
    }
  }

  // Register voter
  registerVoter(): void {
    if (!this.walletAddress) {
      this.showError('Please connect your wallet first');
      return;
    }

    // Check if registration is allowed (state 0)
    if (this.electionState !== 0) {
      this.showError('Registration is only allowed during Registration phase (State 0)');
      return;
    }

    // Check if already registered
    if (this.isVoterRegistered) {
      this.showError('You are already registered as a voter!');
      return;
    }

    this.isRegistering = true;
    this.registrationError = '';
    this.registrationMessage = '';

    this.electionsService.registerVoter(this.walletAddress).subscribe({
      next: (response: any) => {
        this.isRegistering = false;
        
        if (response.success) {
          this.registrationSuccess = true;
          this.isVoterRegistered = true;
          this.voterStatus = { isRegistered: true, hasVoted: false };
          
          this.showSuccess('Registration successful! You are now registered as a voter.');
          
          // Save to localStorage
          localStorage.setItem('registeredVoter', this.walletAddress!);
          localStorage.setItem('registrationTimestamp', new Date().toISOString());
          
          // Navigate to elections page after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/elections']);
          }, 3000);
        } else {
          this.showError(response.message || 'Registration failed');
        }
      },
      error: (error: any) => {
        this.isRegistering = false;
        console.error('Registration error:', error);
        this.showError(error.error?.message || 'Error occurred during registration');
      }
    });
  }

  // Copy wallet address to clipboard
  copyWalletAddress(): void {
    if (this.walletAddress) {
      navigator.clipboard.writeText(this.walletAddress)
        .then(() => this.showMessage('Wallet address copied to clipboard!'))
        .catch(() => this.showError('Failed to copy address'));
    }
  }

  // Disconnect wallet
  disconnectWallet(): void {
    this.walletService.disconnectWallet();
    this.walletAddress = null;
    this.isWalletConnected = false;
    this.isVoterRegistered = false;
    this.voterHasVoted = false;
    this.voterStatus = null;
    this.registrationSuccess = false;
    this.registrationError = '';
  }

  // Navigate to elections page
  goToElections(): void {
    this.router.navigate(['/elections']);
  }

  // Show MetaMask install prompt
  showMetaMaskInstallPrompt(): void {
    const install = confirm('MetaMask is not installed. Would you like to install it?');
    if (install) {
      window.open('https://metamask.io/download/', '_blank');
    }
  }

  // Helper methods for messages
  showSuccess(message: string): void {
    this.registrationMessage = message;
    setTimeout(() => {
      this.registrationMessage = '';
    }, 5000);
  }

  showError(message: string): void {
    this.registrationError = message;
    setTimeout(() => {
      this.registrationError = '';
    }, 5000);
  }

  showMessage(message: string): void {
    alert(message);
  }

  // Format wallet address for display
  formatWalletAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Check if registration is allowed
  canRegister(): boolean {
    return this.electionState === 0 && 
           this.isWalletConnected && 
           !this.registrationSuccess && 
           !this.isVoterRegistered &&
           !this.isCheckingStatus;
  }

  // Get state description
  getStateDescription(state: number): string {
    switch(state) {
      case 0: return 'Registration phase is active. You can register as a voter.';
      case 1: return 'Voting phase is active. Only registered voters can vote.';
      case 2: return 'Results phase. Voting has ended, results are available.';
      default: return 'Unknown system state.';
    }
  }

  // Get state text
  getStateText(state: number): string {
    switch(state) {
      case 0: return 'Registration';
      case 1: return 'Voting';
      case 2: return 'Results';
      default: return 'Unknown';
    }
  }

  // Get current time formatted
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  // Get registration status text
  getRegistrationStatusText(): string {
    if (this.isCheckingStatus) return 'Checking...';
    if (this.isVoterRegistered) return 'Already Registered';
    return 'Not Registered';
  }

  // Get registration status class
  getRegistrationStatusClass(): string {
    if (this.isCheckingStatus) return 'status-checking';
    if (this.isVoterRegistered) return 'status-registered';
    return 'status-not-registered';
  }
}