import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { requireWorkspaceAccess } from '@/lib/ai/requireWorkspaceAccess';
import { pinWardrobeRequestSchema } from '@/lib/wardrobe/pinnedContracts';
import { createOrReuseWorkspacePinnedWardrobeItem } from '@/lib/wardrobe/pinnedServer';

export async function POST(request: Request) {
  try {
    const payload = pinWardrobeRequestSchema.parse(await request.json());
    const access = await requireWorkspaceAccess(payload.workspaceSlug);
    const item = await createOrReuseWorkspacePinnedWardrobeItem(access, payload);
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Pinned wardrobe creation failed.';
    if (message === 'UNAUTHORIZED') {
      return new NextResponse(message, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return new NextResponse(message, { status: 403 });
    }

    return new NextResponse(message, { status: 500 });
  }
}
