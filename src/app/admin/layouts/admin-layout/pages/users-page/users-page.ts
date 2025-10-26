// users-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserListDto, UserStatsDto, UsersResponse } from './models/users';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './users-page.html',
  styleUrls: ['./users-page.css']
})
export class UsersPage implements OnInit {
  users: UserListDto[] = [];
  stats: UserStatsDto | null = null;
  
  // البحث والتصفية
  searchTerm: string = '';
  roleFilter: string = '';
  currentPage: number = 1;
  pageSize: number = 20;
  totalCount: number = 0;
  totalPages: number = 0;
  
  // الحالة
  isLoading: boolean = true;
  isLoadingStats: boolean = true;
  errorMessage: string = '';

  // الأدوار المتاحة
  roles = [
    { value: '', label: 'جميع الأدوار' },
    { value: 'Admin', label: 'مدير' },
    { value: 'User', label: 'مستخدم' }
  ];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStatistics();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.usersService.getUsers(
      this.searchTerm,
      this.roleFilter,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: UsersResponse) => {
        this.users = response.users;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'فشل في تحميل قائمة المستخدمين';
        this.isLoading = false;
      }
    });
  }

  loadStatistics(): void {
    this.isLoadingStats = true;
    
    this.usersService.getUserStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.isLoadingStats = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  deleteUser(user: UserListDto): void {
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.userName}"؟`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('فشل في حذف المستخدم');
        }
      });
    }
  }

  toggleUserActive(user: UserListDto): void {
    this.usersService.toggleUserActive(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error toggling user active:', error);
        alert('فشل في تغيير حالة المستخدم');
      }
    });
  }

  changeUserRole(user: UserListDto, newRole: string): void {
    if (confirm(`هل تريد تغيير دور "${user.userName}" إلى "${newRole}"؟`)) {
      this.usersService.changeUserRole(user.id, { userId: user.id, role: newRole }).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error changing user role:', error);
          alert('فشل في تغيير دور المستخدم');
        }
      });
    }
  }

  resetUserPassword(user: UserListDto): void {
    const newPassword = prompt(`أدخل كلمة المرور الجديدة للمستخدم "${user.userName}":`);
    if (newPassword && newPassword.length >= 6) {
      this.usersService.resetUserPassword(user.id, newPassword).subscribe({
        next: () => {
          alert('تم إعادة تعيين كلمة المرور بنجاح');
        },
        error: (error) => {
          console.error('Error resetting password:', error);
          alert('فشل في إعادة تعيين كلمة المرور');
        }
      });
    } else if (newPassword) {
      alert('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'Admin' ? 'role-admin' : 'role-user';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'مفعل' : 'معطل';
  }
}