import { createHash } from 'node:crypto';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

import type { PinWardrobeRequest, PinnedWardrobeItem } from './pinnedContracts';
import { createPinnedImageSignedUrl, deletePinnedImage, uploadPinnedImage } from './pinnedStorage';

type PinnedWardrobeRow = {
  id: string;
  name: string;
  category: PinnedWardrobeItem['category'];
  source_kind: 'uploaded' | 'system';
  storage_path: string | null;
  source_url: string | null;
};

const buildDedupeKey = (input: { sourceKind: 'uploaded' | 'system'; imageDataUrl?: string; systemItemId?: string; sourceUrl?: string }) => {
  if (input.sourceKind === 'system') {
    return input.systemItemId ? `system:${input.systemItemId}` : `system-url:${input.sourceUrl?.trim()}`;
  }

  return `uploaded:${createHash('sha256').update(input.imageDataUrl || '').digest('hex')}`;
};

const toPinnedClientId = (rowId: string) => `pinned:${rowId}`;

const normalizePinnedRow = async (row: PinnedWardrobeRow): Promise<PinnedWardrobeItem> => ({
  id: toPinnedClientId(row.id),
  name: row.name,
  category: row.category,
  source: row.source_kind === 'system' ? 'system' : 'user',
  url: row.storage_path ? await createPinnedImageSignedUrl(row.storage_path) : row.source_url || '',
  isPinned: true,
});

const decodeDataUrl = (value: string) => {
  const [, base64 = ''] = value.split(',', 2);
  return Uint8Array.from(Buffer.from(base64, 'base64'));
};

export const listWorkspacePinnedWardrobe = async (_workspaceId: string): Promise<PinnedWardrobeItem[]> => {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('workspace_pinned_wardrobe')
    .select('id, name, category, source_kind, storage_path, source_url')
    .eq('workspace_id', _workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return Promise.all(((data as PinnedWardrobeRow[] | null) || []).map(normalizePinnedRow));
};

export const createOrReuseWorkspacePinnedWardrobeItem = async (
  access: { userId: string; workspaceId: string; workspaceSlug: string },
  payload: PinWardrobeRequest,
): Promise<PinnedWardrobeItem> => {
  const admin = createSupabaseAdminClient();
  const dedupeKey = buildDedupeKey(payload);
  const { data: existing, error: existingError } = await admin
    .from('workspace_pinned_wardrobe')
    .select('id, name, category, source_kind, storage_path, source_url')
    .eq('workspace_id', access.workspaceId)
    .eq('dedupe_key', dedupeKey)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return normalizePinnedRow(existing as PinnedWardrobeRow);
  }

  let uploadedPath: string | null = null;

  try {
    if (payload.sourceKind === 'uploaded') {
      uploadedPath = await uploadPinnedImage(
        access.workspaceId,
        dedupeKey.replace(/^uploaded:/, ''),
        decodeDataUrl(payload.imageDataUrl!).buffer as ArrayBuffer,
      );
    }

    const { data, error } = await admin
      .from('workspace_pinned_wardrobe')
      .insert({
        workspace_id: access.workspaceId,
        system_item_id: payload.systemItemId ?? null,
        dedupe_key: dedupeKey,
        name: payload.name,
        category: payload.category,
        source_kind: payload.sourceKind,
        storage_path: uploadedPath,
        source_url: payload.sourceKind === 'system' ? payload.sourceUrl ?? null : null,
        created_by: access.userId,
      })
      .select('id, name, category, source_kind, storage_path, source_url')
      .single();

    if (error) {
      throw error;
    }

    return normalizePinnedRow(data as PinnedWardrobeRow);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isDuplicate = /duplicate|unique/i.test(message);

    if (isDuplicate) {
      if (uploadedPath) {
        await deletePinnedImage(uploadedPath);
      }

      const { data: raced, error: racedError } = await admin
        .from('workspace_pinned_wardrobe')
        .select('id, name, category, source_kind, storage_path, source_url')
        .eq('workspace_id', access.workspaceId)
        .eq('dedupe_key', dedupeKey)
        .single();

      if (racedError) {
        throw racedError;
      }

      return normalizePinnedRow(raced as PinnedWardrobeRow);
    }

    if (uploadedPath) {
      await deletePinnedImage(uploadedPath);
    }

    throw error;
  }
};

export const __private__ = {
  buildDedupeKey,
  normalizePinnedRow,
  toPinnedClientId,
};
