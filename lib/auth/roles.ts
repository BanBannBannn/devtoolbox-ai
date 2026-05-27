export const userRoles = ["user", "moderator", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export type CurrentUserRoleContext = {
  userId: string | null;
  email: string | null;
  role: UserRole;
};

export class RoleAuthenticationError extends Error {
  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "RoleAuthenticationError";
  }
}

export class RolePermissionError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "RolePermissionError";
  }
}

export function parseUserRole(value: unknown): UserRole {
  return typeof value === "string" && userRoles.includes(value as UserRole)
    ? (value as UserRole)
    : "user";
}

export const parseRole = parseUserRole;

export function isModerator(role: UserRole) {
  return role === "moderator";
}

export function isModeratorOrAdmin(role: UserRole) {
  return role === "moderator" || role === "admin";
}

export function isAdmin(role: UserRole) {
  return role === "admin";
}

export function canModerateBlog(role: UserRole) {
  return isModeratorOrAdmin(role);
}

export function canManageUserRoles(role: UserRole) {
  return isAdmin(role);
}

export function assertModeratorOrAdmin(role: UserRole) {
  if (!isModeratorOrAdmin(role)) {
    throw new RolePermissionError();
  }
}

export function assertAdmin(role: UserRole) {
  if (!isAdmin(role)) {
    throw new RolePermissionError("Admin access is required.");
  }
}

export async function getCurrentUserRoleContext(): Promise<CurrentUserRoleContext> {
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      userId: null,
      email: null,
      role: "user",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      email: null,
      role: "user",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      userId: user.id,
      email: user.email ?? null,
      role: "user",
    };
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role: parseUserRole(data.role),
  };
}

export async function getCurrentUserRole(): Promise<UserRole> {
  const context = await getCurrentUserRoleContext();

  return context.role;
}

export async function requireModeratorOrAdmin(): Promise<CurrentUserRoleContext> {
  const context = await getCurrentUserRoleContext();

  if (!context.userId) {
    throw new RoleAuthenticationError();
  }

  assertModeratorOrAdmin(context.role);

  return context;
}

export async function requireAdmin(): Promise<CurrentUserRoleContext> {
  const context = await getCurrentUserRoleContext();

  if (!context.userId) {
    throw new RoleAuthenticationError();
  }

  assertAdmin(context.role);

  return context;
}
