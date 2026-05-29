export const reportReasons = [
  "spam",
  "harassment",
  "hate",
  "sexual_content",
  "violence",
  "misinformation",
  "copyright",
  "other",
] as const;

export const reportStatuses = [
  "open",
  "reviewed",
  "dismissed",
  "action_taken",
] as const;

export type ReportReason = (typeof reportReasons)[number];
export type ReportStatus = (typeof reportStatuses)[number];
export type ReportTargetType = "post" | "comment";
