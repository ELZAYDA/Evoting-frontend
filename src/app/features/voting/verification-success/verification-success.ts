// verification-success.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VerificationDataService } from '../service/verification-data.service'; // إضافة الـ service

@Component({
  selector: 'app-verification-success',
  templateUrl: './verification-success.html',
  styleUrls: ['./verification-success.css'],
  imports: [CommonModule]
})
export class VerificationSuccessComponent implements OnInit, OnDestroy {
  verificationData: any = null;
  matchPercentage: number = 0;
  nationalId: string = '';
  voterId: number = 0;
  verificationDate: string = '';
  redirectTimer: number = 5;
  isRedirecting: boolean = true;
  private timerInterval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private verificationDataService: VerificationDataService // إضافة الـ service
  ) {}

  ngOnInit(): void {
    // محاولة الحصول على البيانات من route state أولاً
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;

    if (state) {
      this.matchPercentage = state.matchPercentage || 0;
      this.nationalId = state.nationalId || '';
      this.voterId = state.voterId || 0;
      this.verificationData = state.verificationResult || null;
    } else {
      // محاولة الحصول من query params
      this.route.queryParams.subscribe(params => {
        this.matchPercentage = params['matchPercentage'] || 0;
        this.nationalId = params['nationalId'] || '';
        this.voterId = params['voterId'] || 0;
      });

      // محاولة الحصول من الـ service
      const status = this.verificationDataService.getVerificationStatus();
      if (status) {
        this.verificationData = status;
        this.matchPercentage = status.matchPercentage || 0;
        this.nationalId = status.nationalId || '';
        this.voterId = status.voterId || 0;
      }
    }

    // الحصول من session storage كحل أخير
    if (!this.verificationData) {
      const storedData = sessionStorage.getItem('verificationData');
      if (storedData) {
        try {
          this.verificationData = JSON.parse(storedData);
        } catch (error) {
          console.error('Error parsing verification data:', error);
        }
      }
    }

    // تنسيق تاريخ التحقق
    this.verificationDate = this.getFormattedDate();

    // بدء عداد التوجيه التلقائي
    this.startRedirectTimer();
  }

  private getFormattedDate(): string {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  startRedirectTimer(): void {
    this.timerInterval = setInterval(() => {
      this.redirectTimer--;
      
      if (this.redirectTimer <= 0) {
        this.isRedirecting = true;
        clearInterval(this.timerInterval);
        this.redirectToElection();
      }
    }, 1000);
  }

  // تعديل الدالة للتوجيه إلى الانتخاب مباشرة
  redirectToElection(): void {
    console.log('Redirecting to elections page...');
    this.router.navigate(['/elections']);
  }

  // دالة التوجيه للصفحة الرئيسية (اختياري)
  redirectToHome(): void {
    this.router.navigate(['/']);
  }

  goToElectionNow(): void {
    this.isRedirecting = false;
    clearInterval(this.timerInterval);
    this.redirectToElection();
  }

  downloadVerification(): void {
    const verificationContent = this.generateVerificationContent();
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(verificationContent));
    element.setAttribute('download', `verification_${this.nationalId}_${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  private generateVerificationContent(): string {
    return `╔══════════════════════════════════════════════════╗
║         VERIFICATION CERTIFICATE              ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  ✅ IDENTITY VERIFICATION SUCCESSFUL            ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  📋 VERIFICATION DETAILS:                        ║
║                                                  ║
║  • National ID: ${this.nationalId.padEnd(26)} ║
║  • Voter ID: ${this.voterId.toString().padEnd(28)} ║
║  • Match Percentage: ${this.matchPercentage.toFixed(1)}%          ║
║  • Verification Date: ${this.verificationDate} ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  📍 NEXT STEP:                                   ║
║  You are now eligible to participate in         ║
║  the upcoming elections.                        ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  🔒 This is a computer-generated document       ║
║     and does not require a signature.           ║
║                                                  ║
╚══════════════════════════════════════════════════╝`;
  }

  printVerification(): void {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verification Certificate</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .certificate { border: 3px solid #28a745; padding: 30px; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .success-icon { color: #28a745; font-size: 48px; }
        .details { margin: 20px 0; }
        .detail-item { margin: 10px 0; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <h1>✅ Verification Successful</h1>
          <p>Identity Verification Certificate</p>
        </div>
        
        <div class="details">
          <div class="detail-item"><strong>National ID:</strong> ${this.nationalId}</div>
          <div class="detail-item"><strong>Voter ID:</strong> ${this.voterId}</div>
          <div class="detail-item"><strong>Match Percentage:</strong> ${this.matchPercentage.toFixed(1)}%</div>
          <div class="detail-item"><strong>Verification Date:</strong> ${this.verificationDate}</div>
        </div>
        
        <div class="footer">
          <p>This document certifies successful identity verification.</p>
          <p>You are now eligible to participate in elections.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  shareVerification(): void {
    const shareText = `✅ My identity verification was successful!\n\n` +
                     `National ID: ${this.nationalId}\n` +
                     `Match: ${this.matchPercentage.toFixed(1)}%\n` +
                     `Date: ${this.verificationDate}\n\n` +
                     `I am now eligible to vote!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Verification Successful',
        text: shareText
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText)
        .then(() => alert('Verification details copied to clipboard!'))
        .catch(() => alert('Failed to copy to clipboard'));
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}