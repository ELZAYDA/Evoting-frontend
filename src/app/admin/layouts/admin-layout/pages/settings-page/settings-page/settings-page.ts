// settings-page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  UserProfile, 
  UpdatePersonalInfoDto, 
  ChangePasswordForm,
  ChangePasswordDto,
  ApiResponse,
  UserRoles,
  UserSearchResult 
} from '../models/settings';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './settings-page.html',
  styleUrls: ['./settings-page.css']
})
export class SettingsPage implements OnInit {
  userProfile: UserProfile = {
    userName: '',
    email: '',
    fullName: '',
    roles: []
  };

  personalInfo: UpdatePersonalInfoDto = {
    fullName: '',
    userName: ''
  };

  passwordInfo: ChangePasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // متغيرات جديدة لإدارة الصلاحيات
  searchEmail: string = '';
  searchedUser: UserSearchResult | null = null;
  selectedRole: string = '';
  isAdmin: boolean = false;

  // حالات التحميل
  isLoading: boolean = true;
  isUpdatingPersonalInfo: boolean = false;
  isChangingPassword: boolean = false;
  checkingUsername: boolean = false;
  isSearchingUser: boolean = false;
  isManagingRoles: boolean = false;

  // رسائل
  personalInfoMessage: string = '';
  personalInfoSuccess: boolean = false;
  passwordMessage: string = '';
  passwordSuccess: boolean = false;
  usernameMessage: string = '';
  isUsernameAvailable: boolean = true;
  roleManagementMessage: string = '';
  roleManagementSuccess: boolean = false;

  constructor(
    private settingsService: SettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // التحقق من وجود token قبل تحميل البيانات
    if (!this.settingsService.isAuthenticated()) {
      this.showPersonalInfoMessage('يجب تسجيل الدخول أولاً', false);
      this.settingsService.redirectToLogin();
      return;
    }
    
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.isLoading = true;
    this.settingsService.getCurrentUser().subscribe({
      next: (user: UserProfile) => {
        this.userProfile = user;
        this.settingsService.setUserProfile(user); // نخزن بيانات المستخدم في الـ service
        this.personalInfo = {
          fullName: user.fullName,
          userName: user.userName
        };
        
        // التحقق إذا المستخدم admin
        this.isAdmin = user.roles.includes('Admin');
        
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
        this.showPersonalInfoMessage(error.message, false);
        
        if (error.message.includes('غير مصرح')) {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    });
  }

  // البحث عن مستخدم
  searchUser(): void {
    if (!this.searchEmail) {
      this.showRoleManagementMessage('يرجى إدخال بريد إلكتروني', false);
      return;
    }

    this.isSearchingUser = true;
    this.settingsService.getUserRoles(this.searchEmail).subscribe({
      next: (roles: string[]) => {
        this.searchedUser = {
          email: this.searchEmail,
          userName: 'غير معروف', // ممكن تضيف API علشان تجيب بيانات المستخدم الكاملة
          fullName: 'غير معروف',
          roles: roles
        };
        this.isSearchingUser = false;
        this.showRoleManagementMessage('تم العثور على المستخدم', true);
      },
      error: (error: Error) => {
        console.error('Error searching user:', error);
        this.isSearchingUser = false;
        this.searchedUser = null;
        this.showRoleManagementMessage(error.message, false);
      }
    });
  }

  // إضافة صلاحية
  assignRole(email: string, role: string): void {
    if (!email || !role) {
      this.showRoleManagementMessage('يرجى اختيار صلاحية', false);
      return;
    }

    this.isManagingRoles = true;
    this.settingsService.assignRole({ email, role }).subscribe({
      next: (response: ApiResponse) => {
        this.isManagingRoles = false;
        this.showRoleManagementMessage(response.message, true);
        
        // تحديث قائمة الصلاحيات
        if (this.searchedUser) {
          if (!this.searchedUser.roles.includes(role)) {
            this.searchedUser.roles.push(role);
          }
        }
        this.selectedRole = '';
      },
      error: (error: Error) => {
        console.error('Error assigning role:', error);
        this.isManagingRoles = false;
        this.showRoleManagementMessage(error.message, false);
      }
    });
  }

  // إزالة صلاحية
  removeRole(email: string, role: string): void {
    if (!email || !role) {
      return;
    }

    if (!confirm(`هل أنت متأكد من إزالة صلاحية "${role}" من المستخدم؟`)) {
      return;
    }

    this.isManagingRoles = true;
    this.settingsService.removeRole({ email, role }).subscribe({
      next: (response: ApiResponse) => {
        this.isManagingRoles = false;
        this.showRoleManagementMessage(response.message, true);
        
        // تحديث قائمة الصلاحيات
        if (this.searchedUser) {
          this.searchedUser.roles = this.searchedUser.roles.filter(r => r !== role);
        }
      },
      error: (error: Error) => {
        console.error('Error removing role:', error);
        this.isManagingRoles = false;
        this.showRoleManagementMessage(error.message, false);
      }
    });
  }

  // الدوال الحالية (بدون تغيير)
  updatePersonalInfo(): void {
    if (!this.personalInfo.fullName || !this.personalInfo.userName) {
      this.showPersonalInfoMessage('يرجى ملء جميع الحقول المطلوبة', false);
      return;
    }

    this.isUpdatingPersonalInfo = true;
    this.settingsService.updatePersonalInfo(this.personalInfo).subscribe({
      next: (updatedUser: UserProfile) => {
        this.userProfile = updatedUser;
        this.isUpdatingPersonalInfo = false;
        this.showPersonalInfoMessage('تم تحديث البيانات الشخصية بنجاح', true);
      },
      error: (error: Error) => {
        console.error('Error updating personal info:', error);
        this.isUpdatingPersonalInfo = false;
        this.showPersonalInfoMessage(error.message, false);
      }
    });
  }

  changePassword(): void {
    if (this.passwordInfo.newPassword !== this.passwordInfo.confirmPassword) {
      this.showPasswordMessage('كلمات المرور غير متطابقة', false);
      return;
    }

    const changePasswordDto: ChangePasswordDto = {
      currentPassword: this.passwordInfo.currentPassword,
      newPassword: this.passwordInfo.newPassword,
      confirmNewPassword: this.passwordInfo.confirmPassword
    };

    this.isChangingPassword = true;
    this.settingsService.changePassword(changePasswordDto).subscribe({
      next: (response: ApiResponse) => {
        this.isChangingPassword = false;
        this.showPasswordMessage(response.message, true);
        this.resetPasswordForm();
      },
      error: (error: Error) => {
        console.error('Error changing password:', error);
        this.isChangingPassword = false;
        this.showPasswordMessage(error.message, false);
      }
    });
  }

  checkUsernameAvailability(): void {
    if (!this.personalInfo.userName || this.personalInfo.userName === this.userProfile.userName) {
      this.usernameMessage = '';
      return;
    }

    this.checkingUsername = true;
    this.settingsService.checkUsernameExists(this.personalInfo.userName).subscribe({
      next: (exists: boolean) => {
        this.checkingUsername = false;
        this.isUsernameAvailable = !exists;
        this.usernameMessage = exists ? 
          'اسم المستخدم موجود مسبقاً' : 
          'اسم المستخدم متاح';
      },
      error: (error: Error) => {
        console.error('Error checking username:', error);
        this.checkingUsername = false;
        this.usernameMessage = 'فشل في التحقق من اسم المستخدم';
      }
    });
  }

  resetPersonalInfoForm(): void {
    this.personalInfo = {
      fullName: this.userProfile.fullName,
      userName: this.userProfile.userName
    };
    this.personalInfoMessage = '';
    this.usernameMessage = '';
  }

  resetPasswordForm(): void {
    this.passwordInfo = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordMessage = '';
  }

  private showPersonalInfoMessage(message: string, success: boolean): void {
    this.personalInfoMessage = message;
    this.personalInfoSuccess = success;
    
    setTimeout(() => {
      this.personalInfoMessage = '';
    }, 5000);
  }

  private showPasswordMessage(message: string, success: boolean): void {
    this.passwordMessage = message;
    this.passwordSuccess = success;
    
    setTimeout(() => {
      this.passwordMessage = '';
    }, 5000);
  }

  private showRoleManagementMessage(message: string, success: boolean): void {
    this.roleManagementMessage = message;
    this.roleManagementSuccess = success;
    
    setTimeout(() => {
      this.roleManagementMessage = '';
    }, 5000);
  }

  logout(): void {
    sessionStorage.removeItem('jwtToken');
    this.router.navigate(['/login']);
  }
}