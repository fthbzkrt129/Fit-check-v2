import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { experimentalRequestSchema } from "@/lib/ai/contracts";
import { generateExperimentalOutfitImage } from "@/lib/ai/providers/falServer";
import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";

export async function POST(request: NextRequest) {
  try {
    const payload = experimentalRequestSchema.parse(await request.json());
    await requireWorkspaceAccess(payload.workspaceSlug);
    const imageUrl = await generateExperimentalOutfitImage(payload);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Experimental image generation failed.';
    if (message === 'UNAUTHORIZED') {
      return new NextResponse(message, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return new NextResponse(message, { status: 403 });
    }

    return new NextResponse(message, { status: 502 });
  }
}
