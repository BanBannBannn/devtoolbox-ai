import { describe, expect, it } from "vitest";
import { getPlanLimitInputFromFormData } from "./plan-limit-admin";

describe("plan limit admin helpers", () => {
  it("clamps unsafe plan limit values from form data", () => {
    const formData = new FormData();
    formData.set("monthly_rag_messages", "-1");
    formData.set("monthly_vectorize_jobs", "200000");
    formData.set("max_saved_documents", "not-a-number");
    formData.set("max_document_characters", "50");
    formData.set("max_chunks_per_document", "20000");
    formData.set("max_chunks_total", "2000000");
    formData.set("retrieved_chunks_per_answer", "99");
    formData.set("max_output_tokens", "9000");
    formData.set("is_active", "on");

    expect(getPlanLimitInputFromFormData("plan-id", formData)).toEqual({
      id: "plan-id",
      monthly_rag_messages: 0,
      monthly_vectorize_jobs: 100000,
      max_saved_documents: 0,
      max_document_characters: 100,
      max_chunks_per_document: 10000,
      max_chunks_total: 1000000,
      retrieved_chunks_per_answer: 20,
      max_output_tokens: 4000,
      is_active: true,
    });
  });
});
