import { NextResponse, type NextRequest } from "next/server";

import { modelRequestSchema } from "@/lib/ai/contracts";
import { generateModelImage } from "@/lib/ai/providers/geminiServer";

export async function POST(request: NextRequest) {
  const payload = modelRequestSchema.parse(await request.json());
  const imageUrl = await generateModelImage(payload.userImage);
  return NextResponse.json({ imageUrl });
}
