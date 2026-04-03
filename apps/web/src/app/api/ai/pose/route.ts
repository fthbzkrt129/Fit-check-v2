import { NextResponse, type NextRequest } from "next/server";

import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";
import { poseRequestSchema } from "@/lib/ai/contracts";
import { generatePoseVariation } from "@/lib/ai/providers/geminiServer";

export async function POST(request: NextRequest) {
  const payload = poseRequestSchema.parse(await request.json());
  await requireWorkspaceAccess(payload.workspaceSlug);
  const imageUrl = await generatePoseVariation(payload.tryOnImage, payload.poseInstruction);
  return NextResponse.json({ imageUrl });
}
