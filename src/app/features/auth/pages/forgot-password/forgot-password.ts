import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ForgetPasswordRequest } from '../../../../core/models/User';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  
  forgetPasswordForm!: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  showEmailSuggestions: boolean = false;
  emailSuggestions: string[] = [];

  ngOnInit(): void {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]] 
    });
  }

  onSubmit(): void {
    if (this.forgetPasswordForm.invalid) {
      this.forgetPasswordForm.markAllAsTouched(); 
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.messageType = '';

    const forgetPasswordData: ForgetPasswordRequest = this.forgetPasswordForm.value;

    this.authService.forgetPassword(forgetPasswordData).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('✅ Forget password response:', res);
        
        if (res.statusCode === 200) {
          this.message = 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني بنجاح. يرجى التحقق من صندوق الوارد أو مجلد البريد العشوائي.';
          this.messageType = 'success';
          
          // إخفاء الرسالة بعد 5 ثواني
          setTimeout(() => {
            this.message = '';
            this.messageType = '';
          }, 5000);
          
          // يمكنك أيضاً إعادة توجيه المستخدم بعد نجاح العملية
          // this.router.navigate(['/auth/reset-password']);
        } else {
          this.message = res.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين';
          this.messageType = 'error';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error during forget password:', err);
        
        this.message = err.error?.message || 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
        this.messageType = 'error';
      }
    });
  }

  onEmailInput(): void {
    const email = this.forgetPasswordForm.get('email')?.value;
    
    if (email && email.includes('@')) {
      const [username, domain] = email.split('@');
      
      if (domain) {
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        this.emailSuggestions = commonDomains
          .filter(commonDomain => commonDomain.startsWith(domain))
          .map(commonDomain => `${username}@${commonDomain}`);
        
        this.showEmailSuggestions = this.emailSuggestions.length > 0;
      } else {
        this.showEmailSuggestions = false;
      }
    } else {
      this.showEmailSuggestions = false;
    }
  }

  selectEmailSuggestion(suggestion: string): void {
    this.forgetPasswordForm.patchValue({ email: suggestion });
    this.showEmailSuggestions = false;
  }

  // إخفاء الاقتراحات عند النقر خارجها
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.email-suggestions') && !target.closest('.input-container')) {
      this.showEmailSuggestions = false;
    }
  }

  // إعادة المحاولة
  retry(): void {
    this.message = '';
    this.messageType = '';
    this.onSubmit();
  }
}