export const TEMP_MAX_DOCUMENT_CHARACTERS = 20000;

export type DocumentContentType = "markdown" | "text";
export type DocumentVectorStatus =
  | "not_vectorized"
  | "vectorizing"
  | "vectorized"
  | "failed";

export type DocumentRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_type: DocumentContentType;
  character_count: number;
  vector_status: DocumentVectorStatus;
  vectorized_at: string | null;
  last_vectorize_error: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentInput = {
  title: string;
  content: string;
  contentType: DocumentContentType;
};
