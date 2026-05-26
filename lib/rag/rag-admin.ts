export function parseRagAdminEmails(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isRagAdminEmail(
  email: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
) {
  if (!email) {
    return false;
  }

  return parseRagAdminEmails(env.RAG_ADMIN_EMAILS).includes(
    email.trim().toLowerCase(),
  );
}
