import { NextResponse, type NextRequest } from "next/server";

import { experimentalRequestSchema } from "@/lib/ai/contracts";
import { generateExperimentalOutfitImage } from "@/lib/ai/providers/falServer";
import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";

export async function POST(request: NextRequest) {
  const payload = experimentalRequestSchema.parse(await request.json());
  await requireWorkspaceAccess(payload.workspaceSlug);
  const imageUrl = await generateExperimentalOutfitImage(payload);
  return NextResponse.json({ imageUrl });
}
