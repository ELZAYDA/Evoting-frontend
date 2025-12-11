// verification-failed.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-failed',
  templateUrl: './verification-failed.html',
  styleUrls: ['./verification-failed.css'],
  imports: [CommonModule]
})
export class VerificationFailedComponent implements OnInit {
  failureReason: string = '';
  verificationData: any = null;
  showDetails: boolean = false;
  redirectTimer: number = 8;
  private timerInterval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Get verification data from session storage
    const storedData = sessionStorage.getItem('verificationData');
    
    if (storedData) {
      try {
        this.verificationData = JSON.parse(storedData);
        
        // Determine failure reason
        this.determineFailureReason();
      } catch (error) {
        console.error('Error parsing verification data:', error);
        this.failureReason = 'Data processing error';
      }
    } else {
      this.failureReason = 'Verification session expired';
    }

    // Start redirect timer
    this.startRedirectTimer();
  }

  determineFailureReason(): void {
    if (!this.verificationData.idCardVerified && !this.verificationData.faceVerified) {
      this.failureReason = 'Both ID card and face verification failed';
    } else if (!this.verificationData.idCardVerified) {
      this.failureReason = 'ID card verification failed';
    } else if (!this.verificationData.faceVerified) {
      this.failureReason = 'Face verification failed';
    } else {
      this.failureReason = 'General verification error';
    }
  }

  startRedirectTimer(): void {
    this.timerInterval = setInterval(() => {
      this.redirectTimer--;
      
      if (this.redirectTimer <= 0) {
        clearInterval(this.timerInterval);
        this.redirectToStart();
      }
    }, 1000);
  }

  redirectToStart(): void {
    this.router.navigate(['/check']);
  }

  retryVerification(): void {
    clearInterval(this.timerInterval);
    
    // Clear previous verification data but keep the national ID
    if (this.verificationData) {
      const nationalId = this.verificationData.nationalId;
      sessionStorage.setItem('verificationData', JSON.stringify({
        nationalId: nationalId
      }));
    }
    
    this.router.navigate(['/verify']);
  }

  contactSupport(): void {
    // In a real app, this would open contact form or email
    const email = 'support@voting-system.com';
    const subject = 'Verification Assistance Required';
    const body = `I need assistance with identity verification.\n\nFailure Reason: ${this.failureReason}\n\nPlease help me resolve this issue.`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  getFailureDetails(): any[] {
    const details = [];
    
    if (this.verificationData) {
      details.push({
        icon: 'fa-id-card',
        label: 'ID Card Status',
        value: this.verificationData.idCardVerified ? '✅ Verified' : '❌ Failed',
        color: this.verificationData.idCardVerified ? 'success' : 'error'
      });

      details.push({
        icon: 'fa-user',
        label: 'Face Verification',
        value: this.verificationData.faceVerified ? '✅ Verified' : '❌ Failed',
        color: this.verificationData.faceVerified ? 'success' : 'error'
      });

      if (this.verificationData.failureMessage) {
        details.push({
          icon: 'fa-exclamation-triangle',
          label: 'Error Message',
          value: this.verificationData.failureMessage,
          color: 'warning'
        });
      }

      details.push({
        icon: 'fa-calendar',
        label: 'Attempt Date',
        value: new Date().toLocaleString(),
        color: 'info'
      });
    }

    return details;
  }

  getCommonSolutions(): any[] {
    return [
      {
        icon: 'fa-lightbulb',
        title: 'Check Image Quality',
        description: 'Ensure your ID card photo is clear, well-lit, and all text is readable'
      },
      {
        icon: 'fa-user-check',
        title: 'Face Positioning',
        description: 'Look directly at the camera with good lighting and remove accessories'
      },
      {
        icon: 'fa-sync-alt',
        title: 'Retry Process',
        description: 'Sometimes network issues can cause verification failures'
      },
      {
        icon: 'fa-headset',
        title: 'Contact Support',
        description: 'Our support team can help resolve technical issues'
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}