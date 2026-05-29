import {
  parseUserRole,
  requireAdmin,
  userRoles,
  type UserRole,
} from "../auth/roles";
import { createServiceRoleSupabaseClient } from "../supabase/server";

export type AdminUserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: UserRole;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminUserListFilters = {
  query?: string;
  role?: string;
};

export type RoleUpdateResult =
  | {
      success: true;
    }
  | {
      success: false;
      code:
        | "auth_required"
        | "forbidden"
        | "invalid_user"
        | "invalid_role"
        | "not_found"
        | "last_admin"
        | "storage_unavailable"
        | "save_failed";
      error: string;
    };

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const profileFields = "id,email,display_name,role,created_at,updated_at";

export function isValidUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && userRoles.includes(value as UserRole);
}

export function getRoleUpdateErrorMessage(code?: string) {
  switch (code) {
    case "auth_required":
      return "Sign in as an admin to manage user roles.";
    case "forbidden":
      return "Admin access is required to manage user roles.";
    case "invalid_user":
      return "Select a valid user profile.";
    case "invalid_role":
      return "Select a valid role.";
    case "not_found":
      return "User profile not found.";
    case "last_admin":
      return "The last admin cannot be demoted.";
    case "storage_unavailable":
      return "Admin user storage is not configured.";
    case "save_failed":
      return "Could not update the user role. Please try again.";
    default:
      return undefined;
  }
}

export function shouldBlockLastAdminDemotion({
  currentRole,
  nextRole,
  adminCount,
}: {
  currentRole: UserRole;
  nextRole: UserRole;
  adminCount: number;
}) {
  return currentRole === "admin" && nextRole !== "admin" && adminCount <= 1;
}

export function getRoleInputFromFormData(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const role = formData.get("role");

  return {
    userId,
    role: isValidUserRole(role) ? role : null,
  };
}

function mapProfileRow(row: ProfileRow): AdminUserProfile {
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    role: parseUserRole(row.role),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeSearch(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function matchesSearch(profile: AdminUserProfile, query: string) {
  if (!query) {
    return true;
  }

  return [profile.id, profile.email, profile.display_name]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(query));
}

export async function listAdminUserProfiles(filters: AdminUserListFilters = {}) {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      code: error instanceof Error && error.name === "RoleAuthenticationError"
        ? "auth_required"
        : "forbidden",
      error:
        error instanceof Error && error.name === "RoleAuthenticationError"
          ? "Authentication is required."
          : "Admin access is required.",
      users: [] as AdminUserProfile[],
    };
  }

  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      code: "storage_unavailable",
      error: "Admin user storage is not configured.",
      users: [] as AdminUserProfile[],
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(profileFields)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    return {
      success: false,
      code: "storage_unavailable",
      error: "Could not load user profiles.",
      users: [] as AdminUserProfile[],
    };
  }

  const roleFilter = isValidUserRole(filters.role) ? filters.role : null;
  const query = normalizeSearch(filters.query);
  const users = (data as ProfileRow[])
    .map(mapProfileRow)
    .filter((profile) => !roleFilter || profile.role === roleFilter)
    .filter((profile) => matchesSearch(profile, query));

  return {
    success: true,
    users,
  };
}

export async function updateAdminUserRole({
  targetUserId,
  nextRole,
}: {
  targetUserId: string;
  nextRole: UserRole | null;
}): Promise<RoleUpdateResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return {
      success: false,
      code:
        error instanceof Error && error.name === "RoleAuthenticationError"
          ? "auth_required"
          : "forbidden",
      error:
        error instanceof Error && error.name === "RoleAuthenticationError"
          ? "Authentication is required."
          : "Admin access is required.",
    };
  }

  if (!targetUserId) {
    return {
      success: false,
      code: "invalid_user",
      error: "Select a valid user profile.",
    };
  }

  if (!nextRole) {
    return {
      success: false,
      code: "invalid_role",
      error: "Select a valid role.",
    };
  }

  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      code: "storage_unavailable",
      error: "Admin user storage is not configured.",
    };
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetError || !targetProfile) {
    return {
      success: false,
      code: "not_found",
      error: "User profile not found.",
    };
  }

  const currentRole = parseUserRole((targetProfile as { role?: string }).role);

  if (currentRole === nextRole) {
    return {
      success: true,
    };
  }

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not verify admin safety.",
    };
  }

  if (
    shouldBlockLastAdminDemotion({
      currentRole,
      nextRole,
      adminCount: count ?? 0,
    })
  ) {
    return {
      success: false,
      code: "last_admin",
      error: "The last admin cannot be demoted.",
    };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: nextRole })
    .eq("id", targetUserId);

  if (updateError) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not update the user role.",
    };
  }

  return {
    success: true,
  };
}
