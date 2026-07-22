"use client";

import { useMemo } from "react";
import {
  canAccessRoute,
  getEffectivePermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/permissions";
import type {
  UserPermission,
  UserRole,
} from "@/types/user";

interface UsePermissionsOptions {
  role?: UserRole | null;
  permissions?: Array<
    UserPermission | string
  >;
}

interface UsePermissionsReturn {
  permissions: string[];
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
  canAccess: (pathname: string) => boolean;
  isSuperAdmin: boolean;
}

export function usePermissions(
  options: UsePermissionsOptions = {},
): UsePermissionsReturn {
  const {
    role = null,
    permissions = [],
  } = options;

  const effectivePermissions = useMemo(
    () =>
      getEffectivePermissions(
        role,
        permissions,
      ),
    [role, permissions],
  );

  return useMemo(
    () => ({
      permissions: effectivePermissions,

      can: (permission: string) =>
        hasPermission(
          permission,
          effectivePermissions,
          role,
        ),

      canAny: (
        requiredPermissions: string[],
      ) =>
        hasAnyPermission(
          requiredPermissions,
          effectivePermissions,
          role,
        ),

      canAll: (
        requiredPermissions: string[],
      ) =>
        hasAllPermissions(
          requiredPermissions,
          effectivePermissions,
          role,
        ),

      canAccess: (pathname: string) =>
        canAccessRoute(
          pathname,
          effectivePermissions,
          role,
        ),

      isSuperAdmin: role === "super_admin",
    }),
    [
      effectivePermissions,
      role,
    ],
  );
}

export default usePermissions;