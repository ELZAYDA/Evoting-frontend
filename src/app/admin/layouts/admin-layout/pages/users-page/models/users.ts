export interface UserListDto {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  roles: string[];
  emailConfirmed: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface UserDetailDto {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  roles: string[];
  emailConfirmed: boolean;
  phoneNumber: string;
  createdAt: string;
  lastLogin: string;
  totalVotes: number;
}

export interface CreateUserDto {
  email: string;
  userName: string;
  fullName: string;
  password: string;
  role: string;
  phoneNumber?: string;
}

export interface UpdateUserDto {
  userName?: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface ChangeUserRoleDto {
  userId: string;
  role: string;
}

export interface UserStatsDto {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  averageAccountAge: number;
}

export interface UsersResponse {
  users: UserListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}