import type {
  UserPermission,
  UserRole,
} from "@/types/user";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  is_staff: boolean;
  permissions?: UserPermission[];
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginFormValues
  extends LoginPayload {
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RefreshTokenPayload {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  emailSent: boolean;
  message?: string;
  expiresAt?: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email?: string;
}

export interface AuthSession {
  user: User;
  access: string;
  refresh?: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue
  extends AuthState {
  login: (
    payload: LoginPayload,
    rememberMe?: boolean,
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUser: (user: User) => void;
  clearError: () => void;
}
