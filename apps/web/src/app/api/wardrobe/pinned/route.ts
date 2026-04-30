import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { requireWorkspaceAccess } from '@/lib/ai/requireWorkspaceAccess';
import { listPinnedWardrobeQuerySchema } from '@/lib/wardrobe/pinnedContracts';
import { listWorkspacePinnedWardrobe } from '@/lib/wardrobe/pinnedServer';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = listPinnedWardrobeQuerySchema.parse({ workspaceSlug: url.searchParams.get('workspaceSlug') });
    const access = await requireWorkspaceAccess(query.workspaceSlug);
    const items = await listWorkspacePinnedWardrobe(access.workspaceId);
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Pinned wardrobe listing failed.';
    if (message === 'UNAUTHORIZED') {
      return new NextResponse(message, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return new NextResponse(message, { status: 403 });
    }

    return new NextResponse(message, { status: 500 });
  }
}
