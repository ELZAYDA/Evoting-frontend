import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../../../core/models/User';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']   // ✅ تعديل هنا
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  loginForm!: FormGroup;
isLoading: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // ✅ عشان يبين رسائل الخطأ
      return;
    }

    const loginData: LoginRequest = this.loginForm.value; // ✅ استخدام LoginRequest

    this.authService.login(loginData).subscribe({
      next: (res) => {
        console.log('✅ Login response:', res);
      
        if (res.success) { 
          sessionStorage.setItem('jwtToken', res.token); // ✅ خزّن JWT في session
          sessionStorage.setItem('role', res.roles[0]); // "Admin"
          sessionStorage.setItem('isLoggedIn', 'true'); // للـ login status
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('❌ Error during Login:', err);
      }
    });
  }
}
