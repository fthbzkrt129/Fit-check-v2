import { NextResponse, type NextRequest } from "next/server";

import { requireWorkspaceAccess } from "@/lib/ai/requireWorkspaceAccess";
import { sceneRequestSchema } from "@/lib/ai/contracts";
import { generateGptSceneVariation } from "@/lib/ai/providers/falServer";

export async function POST(request: NextRequest) {
  const payload = sceneRequestSchema.parse(await request.json());
  await requireWorkspaceAccess(payload.workspaceSlug);
  const imageUrl = await generateGptSceneVariation(
    payload.baseImage,
    payload.scene,
    payload.lighting,
    payload.mode,
    payload.customPrompt
  );
  return NextResponse.json({ imageUrl });
}
