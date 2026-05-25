import { vectorizeDocumentForCurrentUser } from "@/lib/rag/vectorize-document";

type VectorizeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: VectorizeRouteContext) {
  const { id } = await params;
  const result = await vectorizeDocumentForCurrentUser(id);

  if (result.success) {
    return Response.json(result, { status: 200 });
  }

  if (result.error === "Authentication is required.") {
    return Response.json(result, { status: 401 });
  }

  if (result.error === "Document not found.") {
    return Response.json(result, { status: 404 });
  }

  if (
    result.error === "Supabase is not configured." ||
    result.error === "Document vectorization storage is not configured." ||
    result.error === "Usage limits are not configured for your plan."
  ) {
    return Response.json(result, { status: 500 });
  }

  return Response.json(result, { status: result.status === "failed" ? 502 : 400 });
}
