// settings.models.ts
export interface UserProfile {
  userName: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface UpdatePersonalInfoDto {
  fullName: string;
  userName: string;
}

// DTO للفرونت اند (بيحتوي confirmPassword)
export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// DTO للإرسال للـ API (مش محتاج confirmPassword)
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
// الـ DTOs الجديدة لإدارة الصلاحيات
export interface AssignRoleDto {
  email: string;
  role: string;
}

export interface RemoveRoleDto {
  email: string;
  role: string;
}

export interface UserRoles {
  email: string;
  roles: string[];
}

// نموذج للبحث عن المستخدمين
export interface UserSearchResult {
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
}