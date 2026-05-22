"use server";

import { redirect } from "next/navigation";
import {
  createDocumentForCurrentUser,
  deleteDocumentForCurrentUser,
  getDocumentInputFromFormData,
  updateDocumentForCurrentUser,
} from "@/lib/documents";

export async function createDocumentAction(formData: FormData) {
  const result = await createDocumentForCurrentUser(
    getDocumentInputFromFormData(formData),
  );

  if (!result.success) {
    redirect(`/dashboard/documents/new?error=${result.code}`);
  }

  redirect(`/dashboard/documents/${result.documentId}?message=created`);
}

export async function updateDocumentAction(id: string, formData: FormData) {
  const result = await updateDocumentForCurrentUser(
    id,
    getDocumentInputFromFormData(formData),
  );

  if (!result.success) {
    redirect(`/dashboard/documents/${id}?error=${result.code}`);
  }

  redirect(`/dashboard/documents/${id}?message=saved`);
}

export async function deleteDocumentAction(id: string) {
  const result = await deleteDocumentForCurrentUser(id);

  if (!result.success) {
    redirect(`/dashboard/documents/${id}?error=${result.code}`);
  }

  redirect("/dashboard/documents?message=deleted");
}
