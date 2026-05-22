import { redirect } from "next/navigation";
import {
  TEMP_MAX_DOCUMENT_CHARACTERS,
  type DocumentInput,
  type DocumentRow,
} from "@/lib/document-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DocumentActionResult =
  | {
      success: true;
      document?: DocumentRow;
      documentId?: string;
    }
  | {
      success: false;
      error: string;
      code:
        | "auth_required"
        | "not_found"
        | "invalid_title"
        | "invalid_content"
        | "content_too_long"
        | "save_failed"
        | "delete_failed";
    };

type AuthenticatedSupabase = {
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
  userId: string;
};

export function getDocumentInputFromFormData(formData: FormData): DocumentInput {
  const rawContentType = String(formData.get("content_type") ?? "markdown");

  return {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    contentType: rawContentType === "text" ? "text" : "markdown",
  };
}

export function validateDocumentInput(
  input: DocumentInput,
): DocumentActionResult | null {
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title) {
    return {
      success: false,
      code: "invalid_title",
      error: "Add a document title before saving.",
    };
  }

  if (!content) {
    return {
      success: false,
      code: "invalid_content",
      error: "Add document content before saving.",
    };
  }

  if (input.content.length > TEMP_MAX_DOCUMENT_CHARACTERS) {
    return {
      success: false,
      code: "content_too_long",
      error: `Document content must be ${TEMP_MAX_DOCUMENT_CHARACTERS.toLocaleString()} characters or fewer.`,
    };
  }

  return null;
}

export function normalizeDocumentInput(input: DocumentInput): DocumentInput {
  return {
    title: input.title.trim(),
    content: input.content,
    contentType: input.contentType,
  };
}

export async function requireAuthenticatedSupabase(): Promise<AuthenticatedSupabase> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?error=auth_config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return {
    supabase,
    userId: user.id,
  };
}

export async function listDocumentsForCurrentUser() {
  const { supabase } = await requireAuthenticatedSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id,user_id,title,content,content_type,character_count,vector_status,vectorized_at,last_vectorize_error,created_at,updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as DocumentRow[];
}

export async function getDocumentForCurrentUser(id: string) {
  const { supabase } = await requireAuthenticatedSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id,user_id,title,content,content_type,character_count,vector_status,vectorized_at,last_vectorize_error,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as DocumentRow;
}

export async function createDocumentForCurrentUser(
  input: DocumentInput,
): Promise<DocumentActionResult> {
  const invalidResult = validateDocumentInput(input);

  if (invalidResult) {
    return invalidResult;
  }

  const { supabase, userId } = await requireAuthenticatedSupabase();
  const normalizedInput = normalizeDocumentInput(input);
  const characterCount = normalizedInput.content.length;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: normalizedInput.title,
      content: normalizedInput.content,
      content_type: normalizedInput.contentType,
      character_count: characterCount,
      vector_status: "not_vectorized",
      vectorized_at: null,
      last_vectorize_error: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not save the document. Please try again.",
    };
  }

  return {
    success: true,
    documentId: (data as { id: string }).id,
  };
}

export async function updateDocumentForCurrentUser(
  id: string,
  input: DocumentInput,
): Promise<DocumentActionResult> {
  const invalidResult = validateDocumentInput(input);

  if (invalidResult) {
    return invalidResult;
  }

  const { supabase, userId } = await requireAuthenticatedSupabase();
  const existingDocument = await getDocumentForCurrentUser(id);

  if (!existingDocument) {
    return {
      success: false,
      code: "not_found",
      error: "Document not found.",
    };
  }

  const normalizedInput = normalizeDocumentInput(input);
  const characterCount = normalizedInput.content.length;
  const contentChanged = normalizedInput.content !== existingDocument.content;
  const vectorResetFields = contentChanged
    ? {
        vector_status: "not_vectorized",
        vectorized_at: null,
        last_vectorize_error: null,
      }
    : {};

  const { data, error } = await supabase
    .from("documents")
    .update({
      title: normalizedInput.title,
      content: normalizedInput.content,
      content_type: normalizedInput.contentType,
      character_count: characterCount,
      ...vectorResetFields,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select(
      "id,user_id,title,content,content_type,character_count,vector_status,vectorized_at,last_vectorize_error,created_at,updated_at",
    )
    .single();

  if (error || !data) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not update the document. Please try again.",
    };
  }

  return {
    success: true,
    document: data as DocumentRow,
  };
}

export async function deleteDocumentForCurrentUser(
  id: string,
): Promise<DocumentActionResult> {
  const { supabase, userId } = await requireAuthenticatedSupabase();
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return {
      success: false,
      code: "delete_failed",
      error: "Could not delete the document. Please try again.",
    };
  }

  return {
    success: true,
  };
}

export function getDocumentErrorMessage(code?: string) {
  switch (code) {
    case "invalid_title":
      return "Add a document title before saving.";
    case "invalid_content":
      return "Add document content before saving.";
    case "content_too_long":
      return `Document content must be ${TEMP_MAX_DOCUMENT_CHARACTERS.toLocaleString()} characters or fewer.`;
    case "save_failed":
      return "Could not save the document. Please try again.";
    case "delete_failed":
      return "Could not delete the document. Please try again.";
    case "not_found":
      return "Document not found.";
    default:
      return undefined;
  }
}
