import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { resetPasswordRequest } from '../../../../core/models/User';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetPasswordForm!: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  email: string = '';
  token: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // 1. جلب الـ email & token من اللينك
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.token) {
        this.message = 'رابط إعادة التعيين غير صالح';
        this.messageType = 'error';
      }
    });

    // 2. بناء الفورم
    this.resetPasswordForm = this.fb.group({
      NewPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      ConfirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // 3. التحقق من تطابق كلمة السر - ✅ التصحيح هنا
  private passwordMatchValidator(form: FormGroup) {
    const NewPassword = form.get('NewPassword')?.value;  // ✅ صححت الاسم
    const ConfirmNewPassword = form.get('ConfirmNewPassword')?.value;  // ✅ صححت الاسم

    if (NewPassword && ConfirmNewPassword && NewPassword !== ConfirmNewPassword) {
      form.get('ConfirmNewPassword')?.setErrors({ passwordMismatch: true });  // ✅ صححت الاسم
    } else {
      form.get('ConfirmNewPassword')?.setErrors(null);  // ✅ صححت الاسم
    }
  }

  // 4. تنفيذ العملية
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.email || !this.token) {
      this.message = 'رابط إعادة التعيين غير صالح';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const resetPasswordRequest: resetPasswordRequest = this.resetPasswordForm.value;
    resetPasswordRequest.email = this.email;
    resetPasswordRequest.token = this.token;

    this.authService.resetPassword(resetPasswordRequest).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.statusCode === 200) {
          this.message = '✅ تم إعادة تعيين كلمة المرور بنجاح';
          this.messageType = 'success';

          // توجيه المستخدم لصفحة اللوجين بعد شوية
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.message = res.message || '❌ فشل إعادة تعيين كلمة المرور';
          this.messageType = 'error';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error during reset password:', err);

        this.message = err.error?.message || 'حدث خطأ في السيرفر. حاول مرة أخرى.';
        this.messageType = 'error';
      }
    });
  }
}