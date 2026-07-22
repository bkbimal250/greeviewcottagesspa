import api from "@/lib/api";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";
import type { ApiResponse } from "@/types/api";

type MaybeWrapped<T> = T | { data: T };

function unwrapData<T>(response: MaybeWrapped<T>): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return response.data;
  }

  return response;
}

const AUTH_ENDPOINTS = {
  login: "/auth/login/",
  logout: "/auth/logout/",
  profile: "/auth/profile/",
  refreshToken: "/auth/token/refresh/",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  changePassword: "/auth/change-password",
  updateProfile: "/auth/profile/",
} as const;

export const authService = {
  /**
   * Authenticate an administrator.
   */
  async login(
    payload: LoginPayload,
  ): Promise<AuthResponse> {
    const response = await api.post<
      MaybeWrapped<AuthResponse>
    >(AUTH_ENDPOINTS.login, payload);

    return unwrapData(response.data);
  },

  /**
   * End the current authenticated session.
   */
  async logout(): Promise<void> {
    const refresh =
      typeof window !== "undefined"
        ? window.localStorage.getItem(
            "admin_refresh_token",
          )
        : null;

    await api.post<ApiResponse<null>>(
      AUTH_ENDPOINTS.logout,
      refresh ? { refresh } : {},
    );
  },

  /**
   * Retrieve the currently authenticated user.
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<
      MaybeWrapped<User>
    >(AUTH_ENDPOINTS.profile);

    return unwrapData(response.data);
  },

  async getProfile(): Promise<User> {
    return this.getCurrentUser();
  },

  /**
   * Request a new access token using a refresh token.
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<AuthResponse> {
    const response = await api.post<
      MaybeWrapped<{ access: string; refresh?: string }>
    >(AUTH_ENDPOINTS.refreshToken, {
      refresh: refreshToken,
    });
    const tokens = unwrapData(response.data);

    return {
      access: tokens.access,
      refresh: tokens.refresh || refreshToken,
      user: await this.getCurrentUser(),
    };
  },

  /**
   * Send password reset instructions.
   */
  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<string> {
    const response = await api.post<
      ApiResponse<null>
    >(AUTH_ENDPOINTS.forgotPassword, payload);

    return (
      response.data.message ||
      "Password reset instructions have been sent."
    );
  },

  /**
   * Reset a password using a valid reset token.
   */
  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<string> {
    const response = await api.post<
      ApiResponse<null>
    >(AUTH_ENDPOINTS.resetPassword, payload);

    return (
      response.data.message ||
      "Your password has been reset successfully."
    );
  },

  /**
   * Change the password of the authenticated user.
   */
  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<string> {
    const response = await api.put<
      ApiResponse<null>
    >(AUTH_ENDPOINTS.changePassword, payload);

    return (
      response.data.message ||
      "Password changed successfully."
    );
  },

  /**
   * Update the authenticated administrator profile.
   */
  async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<User> {
    const response = await api.patch<
      MaybeWrapped<User>
    >(AUTH_ENDPOINTS.updateProfile, payload);

    return unwrapData(response.data);
  },
};

export default authService;
