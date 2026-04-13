import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { secureModelRequestSchema } from "@/lib/ai/contracts";
import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";
import { generateIdentityReferenceImage, generateModelImage, generateModelSwapImage } from "@/lib/ai/providers/geminiServer";

export async function POST(request: NextRequest) {
  try {
    const payload = secureModelRequestSchema.parse(await request.json());

    let imageUrl: string;

    if ('operation' in payload && payload.operation === 'identity-reference') {
      await requireWorkspaceAccess(payload.workspaceSlug);
      imageUrl = await generateIdentityReferenceImage(payload.userImage);
    } else if ('operation' in payload && payload.operation === 'swap') {
      await requireWorkspaceAccess(payload.workspaceSlug);
      imageUrl = await generateModelSwapImage(payload.referenceLookImage, payload.identityReferenceImage);
    } else {
      await requireWorkspaceAccess(payload.workspaceSlug);
      imageUrl = await generateModelImage(payload.userImage);
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Model generation failed.";
    if (message === 'UNAUTHORIZED') {
      return new NextResponse(message, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return new NextResponse(message, { status: 403 });
    }
    const status = /gemini|provider|request failed|api key|did not return/i.test(message) ? 502 : 400;
    return new NextResponse(message, { status });
  }
}
