import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  @Input() layout!: string;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isMenuOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    // التحقق من حالة الدخول
    this.isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    // التحقق من صلاحية الـ Admin
    this.checkAdminRole();
  }

  checkAdminRole(): void {
    if (this.isLoggedIn) {
      // الطريقة الأولى: من الـ role مباشرة
      const role = sessionStorage.getItem('role');
      this.isAdmin = role === 'Admin';
      
      // الطريقة الثانية: من الـ userData إذا كانت موجودة
      if (!this.isAdmin) {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            this.isAdmin = user.roles?.includes('Admin') || false;
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }
      
      console.log('🔐 Admin Status:', this.isAdmin);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToAdminDashboard(): void {
    this.router.navigate(['/admin/']);
  }

  logout(): void {
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.router.navigate(['/home']);
    this.isMenuOpen = false;
  }
}