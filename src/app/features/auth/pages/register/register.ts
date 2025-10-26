import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../../../core/models/User';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  // Dependency Injection
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Component State
  registerForm!: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the registration form with validators
   */
  private initializeForm(): void {
    this.registerForm = this.fb.group({
      userName: [
        '', 
        [
          Validators.required, 
          Validators.minLength(3), 
          Validators.maxLength(50)
        ]
      ],
      email: [
        '', 
        [
          Validators.required, 
          Validators.email
        ]
      ],
      fullName: [
        '', 
        [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(100)
        ]
      ],
      password: [
        '', 
        [
          Validators.required, 
          Validators.minLength(6), 
          Validators.maxLength(100)
        ]
      ],
      confirmPassword: [
        '', 
        [Validators.required]
      ]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.performRegistration();
    } else {
      this.markFormAsTouched();
    }
  }

  /**
   * Perform the actual registration API call
   */
  private performRegistration(): void {
    this.isLoading = true;
    this.message = '';
    
    const registerData: RegisterRequest = this.registerForm.value;
    
    this.authService.register(registerData).subscribe({
      next: (res) => this.handleRegistrationSuccess(res),
      error: (err) => this.handleRegistrationError(err)
    });
  }

  /**
   * Handle successful registration response
   */
  private handleRegistrationSuccess(res: any): void {
    this.isLoading = false;
    console.log('✅ Registration response:', res);
    
    if (res.success === true) {
      this.message = 'تم إنشاء الحساب بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول.';
      this.messageType = 'success';
      this.redirectToLogin();
    } else {
      this.message = res.message || 'حدث خطأ أثناء إنشاء الحساب';
      this.messageType = 'error';
    }
  }

  /**
   * Handle registration error
   */
  private handleRegistrationError(err: any): void {
    this.isLoading = false;
    console.error('❌ Error during registration:', err);
    
    this.message = err.error?.message || 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
    this.messageType = 'error';
  }

  /**
   * Redirect to login page after successful registration
   */
  private redirectToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  /**
   * Mark all form fields as touched to trigger validation messages
   */
  private markFormAsTouched(): void {
    this.registerForm.markAllAsTouched();
  }

  /**
   * Get password strength indicator
   */
  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value;
    if (!password) return '';
    
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    
    // Check for strong password (mix of characters)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    return strength >= 3 ? 'strong' : 'medium';
  }

  /**
   * Get password strength text for display
   */
  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'ضعيفة';
      case 'medium': return 'متوسطة';
      case 'strong': return 'قوية';
      default: return '';
    }
  }

  /**
   * Check if a specific field has errors
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.hasError(errorType) && field.touched : false;
  }

  /**
   * Get error message for a specific field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }
    
    const errors = field.errors;
    
    if (errors['required']) {
      return 'هذا الحقل مطلوب';
    }
    
    if (errors['minlength']) {
      switch (fieldName) {
        case 'userName': return 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل';
        case 'fullName': return 'يجب أن يكون الاسم الكامل حرفين على الأقل';
        case 'password': return 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
        default: return 'القيمة قصيرة جداً';
      }
    }
    
    if (errors['maxlength']) {
      switch (fieldName) {
        case 'userName': return 'يجب أن لا يتعدى اسم المستخدم 50 حرفاً';
        case 'fullName': return 'يجب أن لا يتعدى الاسم الكامل 100 حرف';
        default: return 'القيمة طويلة جداً';
      }
    }
    
    if (errors['email']) {
      return 'يرجى إدخال بريد إلكتروني صحيح';
    }
    
    return '';
  }
}