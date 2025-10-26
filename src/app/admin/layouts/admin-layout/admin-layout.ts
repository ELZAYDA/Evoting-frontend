import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = true;
  currentPageTitle = 'لوحة التحكم';
  userName = 'مدير النظام';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setPageTitle();
    
    // تحديث العنوان عند تغيير المسار
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setPageTitle();
      });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
  sessionStorage.clear(); // يمسح كل حاجة

    // التوجيه لصفحة تسجيل الدخول
    this.router.navigate(['/auth/login']);
  }

  private setPageTitle(): void {
    const url = this.router.url;
    
    if (url.includes('/admin/elections')) {
      this.currentPageTitle = 'إدارة الانتخابات';
    } else if (url.includes('/admin/candidates')) {
      this.currentPageTitle = 'إدارة المرشحين';
    } else if (url.includes('/admin/users')) {
      this.currentPageTitle = 'إدارة المستخدمين';
    } else if (url.includes('/admin/settings')) {
      this.currentPageTitle = 'الإعدادات';
    } else {
      this.currentPageTitle = 'لوحة التحكم';
    }
  }
}