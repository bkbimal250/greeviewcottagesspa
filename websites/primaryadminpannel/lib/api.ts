import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

interface RetryRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  data?: {
    access?: string;
    refresh?: string;
  };
  access?: string;
  refresh?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.backend.greencottagesandspa.in/api/v1";

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null =
  null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(
    ACCESS_TOKEN_KEY,
  );
}

function getRefreshToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(
    REFRESH_TOKEN_KEY,
  );
}

function storeTokens(
  accessToken: string,
  refreshToken?: string,
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  if (refreshToken) {
    window.localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken,
    );
  }
}

export function clearAuthTokens(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  window.localStorage.removeItem(
    REFRESH_TOKEN_KEY,
  );
}

function redirectToLogin(): void {
  if (!isBrowser()) {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;

  const isAuthPage =
    window.location.pathname === "/login" ||
    window.location.pathname ===
      "/forgot-password" ||
    window.location.pathname ===
      "/reset-password";

  if (isAuthPage) {
    return;
  }

  const redirectUrl = encodeURIComponent(
    currentPath,
  );

  window.location.href = `/login?redirect=${redirectUrl}`;
}

async function refreshAccessToken(): Promise<
  string | null
> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response =
      await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/token/refresh/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

    const accessToken =
      response.data.data?.access ||
      response.data.access;

    const newRefreshToken =
      response.data.data?.refresh ||
      response.data.refresh;

    if (!accessToken) {
      return null;
    }

    storeTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch {
    clearAuthTokens();
    return null;
  }
}

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) =>
    Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | RetryRequestConfig
        | undefined;

    const status = error.response?.status;

    const isRefreshRequest =
      originalRequest?.url?.includes(
        "/auth/token/refresh",
      );

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise =
        refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
    }

    const newAccessToken =
      await refreshPromise;

    if (!newAccessToken) {
      clearAuthTokens();
      redirectToLogin();

      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    return api(originalRequest);
  },
);

export function setAuthTokens(
  accessToken: string,
  refreshToken?: string,
): void {
  storeTokens(accessToken, refreshToken);
}

export function getStoredAccessToken():
  | string
  | null {
  return getAccessToken();
}

export function getStoredRefreshToken():
  | string
  | null {
  return getRefreshToken();
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
        | {
            message?: string;
            error?: string;
            detail?: string;
            errors?: Record<
              string,
              string | string[] | Record<string, string[]>
            >;
            non_field_errors?: string[];
          }
      | undefined;

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    if (responseData?.detail) {
      return responseData.detail;
    }

    if (responseData?.non_field_errors?.[0]) {
      return responseData.non_field_errors[0];
    }

    if (responseData?.errors) {
      const firstError = Object.values(
        responseData.errors,
      )[0];

      if (Array.isArray(firstError)) {
        return firstError[0] || fallback;
      }

      if (typeof firstError === "string") {
        return firstError;
      }
    }

    if (error.code === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }

    if (!error.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function apiRequest<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await api.request<T>(config);

  return response.data;
}

export default api;
