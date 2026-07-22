"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import authService from "@/services/auth.service";
import {
  canAccessAdminPanel,
  clearAuthSession,
  getStoredUser,
  isAuthenticated,
  saveAuthSession,
  updateStoredUser,
} from "@/lib/auth";
import type {
  AuthResponse,
  LoginPayload,
  User,
} from "@/types/auth";

interface UseAuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface UseAuthReturn extends UseAuthState {
  login: (
    payload: LoginPayload,
    rememberMe?: boolean,
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const initialiseAuth = useCallback(async () => {
    const storedUser = getStoredUser();
    const hasSession = isAuthenticated();

    if (!hasSession) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      return;
    }

    if (storedUser) {
      if (!canAccessAdminPanel(storedUser)) {
        clearAuthSession();

        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });

        return;
      }

      setState({
        user: storedUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    }

    try {
      const user = await authService.getProfile();

      if (!canAccessAdminPanel(user)) {
        clearAuthSession();

        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });

        return;
      }

      updateStoredUser(user);

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch {
      clearAuthSession();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void initialiseAuth();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialiseAuth]);

  const login = useCallback(
    async (
      payload: LoginPayload,
      rememberMe = false,
    ): Promise<AuthResponse> => {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
        error: null,
      }));

      try {
        const authResponse =
          await authService.login(payload);

        if (
          !canAccessAdminPanel(authResponse.user)
        ) {
          clearAuthSession();
          throw new Error(
            "Only super admin and admin accounts can access the admin panel.",
          );
        }

        saveAuthSession(authResponse, rememberMe);

        setState({
          user: authResponse.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        return authResponse;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to sign in.";

        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: message,
        });

        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: null,
    }));

    try {
      await authService.logout();
    } catch {
      // The local session should still be cleared
      // when the server logout request fails.
    } finally {
      clearAuthSession();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  const refreshUser =
    useCallback(async (): Promise<User | null> => {
      if (!isAuthenticated()) {
        clearAuthSession();

        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });

        return null;
      }

      setState((currentState) => ({
        ...currentState,
        isLoading: true,
        error: null,
      }));

      try {
        const user = await authService.getProfile();

        updateStoredUser(user);

        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        return user;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your profile.";

        setState((currentState) => ({
          ...currentState,
          isLoading: false,
          error: message,
        }));

        return null;
      }
    }, []);

  const updateUser = useCallback((user: User) => {
    updateStoredUser(user);

    setState((currentState) => ({
      ...currentState,
      user,
      isAuthenticated: true,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      error: null,
    }));
  }, []);

  return useMemo(
    () => ({
      ...state,
      login,
      logout,
      refreshUser,
      updateUser,
      clearError,
    }),
    [
      state,
      login,
      logout,
      refreshUser,
      updateUser,
      clearError,
    ],
  );
}

export default useAuth;
