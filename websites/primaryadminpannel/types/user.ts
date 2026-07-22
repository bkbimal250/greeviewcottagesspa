export type UserRole =
  | "super_admin"
  | "admin"
  | "staff";

export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "invited";

export interface UserPermission {
  id?: string;
  key: string;
  name?: string;
  description?: string;
  module?: string;
}

export interface UserPropertyAccess {
  propertyId: string;
  propertyName?: string;
  isPrimary?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  permissions?: UserPermission[];
  propertyIds?: string[];
  properties?: UserPropertyAccess[];
  emailVerifiedAt?: string | null;
  invitationExpiresAt?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  passwordChangeRequired?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  propertyId?: string;
  emailVerified?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  status?: UserStatus;
  avatar?: string;
  propertyIds?: string[];
  permissions?: UserPermission[];
  sendInvitation?: boolean;
  passwordChangeRequired?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  role?: UserRole;
  status?: UserStatus;
  propertyIds?: string[];
  permissions?: UserPermission[];
  passwordChangeRequired?: boolean;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
  reason?: string;
}

export interface UpdateUserRolePayload {
  role: UserRole;
  propertyIds?: string[];
}

export interface ResetUserPasswordPayload {
  temporaryPassword?: string;
  sendEmail?: boolean;
  requirePasswordChange?: boolean;
}

export interface ResetUserPasswordResult {
  temporaryPassword?: string;
  emailSent: boolean;
}

export interface UpdateUserPermissionsPayload {
  permissions: UserPermission[];
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description?: string;
  module?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  invitedUsers: number;
  usersByRole: Array<{
    role: UserRole;
    count: number;
  }>;
}

export interface InviteUserPayload {
  name: string;
  email: string;
  role: UserRole;
  propertyIds?: string[];
  permissions?: UserPermission[];
  message?: string;
}

export interface InviteUserResult {
  user: User;
  invitationSent: boolean;
  invitationExpiresAt?: string;
}
