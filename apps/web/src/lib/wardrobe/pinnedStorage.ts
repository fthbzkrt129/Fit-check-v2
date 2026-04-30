import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'wardrobe-pinned';

const buildPinnedStoragePath = (workspaceId: string, fingerprint: string) =>
  `workspace/${workspaceId}/pinned/${fingerprint}.png`;

export const uploadPinnedImage = async (workspaceId: string, fingerprint: string, fileBody: ArrayBuffer) => {
  const path = buildPinnedStoragePath(workspaceId, fingerprint);
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(path, fileBody, { contentType: 'image/png', upsert: false });

  if (error) {
    throw error;
  }

  return path;
};

export const deletePinnedImage = async (path: string) => {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(BUCKET).remove([path]);

  if (error) {
    throw error;
  }
};

export const createPinnedImageSignedUrl = async (path: string) => {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
};

export const __private__ = { buildPinnedStoragePath };
