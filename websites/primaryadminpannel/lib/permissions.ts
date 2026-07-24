import type {
  UserPermission,
  UserRole,
} from "@/types/user";

export const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "admin",
];

export const STAFF_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "staff",
];

export const PERMISSIONS = {
  adminAccess: "admin.access",
} as const;

export type PermissionValue =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function normalizePermissions(
  permissions?: Array<
    UserPermission | PermissionValue | string
  >,
): string[] {
  if (!permissions) {
    return [];
  }

  return permissions
    .map((permission) =>
      typeof permission === "string"
        ? permission
        : permission.key,
    )
    .filter(Boolean);
}

export function getRolePermissions(
  role?: UserRole | null,
): PermissionValue[] {
  return role && STAFF_ROLES.includes(role)
    ? [PERMISSIONS.adminAccess]
    : [];
}

export function getEffectivePermissions(
  role?: UserRole | null,
  customPermissions?: Array<
    UserPermission | PermissionValue | string
  >,
): string[] {
  return Array.from(
    new Set([
      ...getRolePermissions(role),
      ...normalizePermissions(customPermissions),
    ]),
  );
}

export function hasPermission(
  requiredPermission: string,
  userPermissions?: Array<
    UserPermission | PermissionValue | string
  >,
  role?: UserRole | null,
): boolean {
  if (
    requiredPermission === PERMISSIONS.adminAccess
  ) {
    return Boolean(
      role && STAFF_ROLES.includes(role),
    );
  }

  return normalizePermissions(
    userPermissions,
  ).includes(requiredPermission);
}

export function hasAnyPermission(
  requiredPermissions: string[],
  userPermissions?: Array<
    UserPermission | PermissionValue | string
  >,
  role?: UserRole | null,
): boolean {
  return (
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) =>
      hasPermission(
        permission,
        userPermissions,
        role,
      ),
    )
  );
}

export function hasAllPermissions(
  requiredPermissions: string[],
  userPermissions?: Array<
    UserPermission | PermissionValue | string
  >,
  role?: UserRole | null,
): boolean {
  return requiredPermissions.every((permission) =>
    hasPermission(
      permission,
      userPermissions,
      role,
    ),
  );
}

export function canAccessRoute(
  pathname: string,
  _userPermissions?: Array<
    UserPermission | PermissionValue | string
  >,
  role?: UserRole | null,
): boolean {
  const supportedRoutes = [
    "/dashboard",
    "/property",
    "/cottages",
    "/availability",
    "/bookings",
    "/payments",
    "/notifications",
    "/profile",
  ];

  const isSupported = supportedRoutes.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  );

  return Boolean(
    isSupported &&
      role &&
      ADMIN_ROLES.includes(role),
  );
}

export function filterByPermission<T>(
  items: T[],
): T[] {
  return items;
}
