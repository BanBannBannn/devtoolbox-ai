import { answerRagChatForCurrentUser } from "@/lib/rag/rag-chat";

type RagChatApiResponse =
  | Awaited<ReturnType<typeof answerRagChatForCurrentUser>>
  | {
      success: false;
      error: string;
    };

function jsonResponse(body: RagChatApiResponse, status: number) {
  if (!body.success && "statusCode" in body) {
    return Response.json(
      {
        success: false,
        error: body.error,
      },
      { status },
    );
  }

  return Response.json(body, { status });
}

async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const result = await answerRagChatForCurrentUser(body);

  if (!result.success) {
    return jsonResponse(result, result.statusCode);
  }

  return jsonResponse(result, 200);
}
