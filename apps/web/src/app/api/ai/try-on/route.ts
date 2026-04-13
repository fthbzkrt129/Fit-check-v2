import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";
import { tryOnRequestSchema } from "@/lib/ai/contracts";
import { generateVirtualTryOnImage } from "@/lib/ai/providers/geminiServer";

export async function POST(request: NextRequest) {
  try {
    const payload = tryOnRequestSchema.parse(await request.json());
    await requireWorkspaceAccess(payload.workspaceSlug);
    const imageUrl = await generateVirtualTryOnImage(
      payload.modelImage,
      payload.garmentImage,
      payload.category,
      payload.topLength ?? undefined,
      payload.dressLength ?? undefined,
      payload.outerwearLength ?? undefined,
    );
    return NextResponse.json({ imageUrl });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    throw error;
  }
}
