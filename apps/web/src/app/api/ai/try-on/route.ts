import { NextResponse, type NextRequest } from "next/server";

import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";
import { tryOnRequestSchema } from "@/lib/ai/contracts";
import { generateVirtualTryOnImage } from "@/lib/ai/providers/geminiServer";

export async function POST(request: NextRequest) {
  const payload = tryOnRequestSchema.parse(await request.json());
  await requireWorkspaceAccess(payload.workspaceSlug);
  const imageUrl = await generateVirtualTryOnImage(payload.modelImage, payload.garmentImage, payload.category);
  return NextResponse.json({ imageUrl });
}
