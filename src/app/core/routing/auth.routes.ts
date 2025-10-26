import { Routes } from '@angular/router';
import { LoginComponent } from '../../features/auth/pages/login/login';
import { RegisterComponent } from '../../features/auth/pages/register/register';
import { ForgetPasswordComponent } from '../../features/auth/pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from '../../features/auth/pages/reset-password/reset-password';

export const authRoutes: Routes = [
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forget-password', component: ForgetPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];