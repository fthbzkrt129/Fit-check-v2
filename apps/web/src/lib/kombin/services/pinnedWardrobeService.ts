import { pinnedWardrobeItemSchema, pinnedWardrobeListResponseSchema } from '@/lib/wardrobe/pinnedContracts';

export const listPinnedWardrobeItems = async (workspaceSlug: string, fetchImpl: typeof fetch = fetch) => {
  const response = await fetchImpl(`/api/wardrobe/pinned?workspaceSlug=${encodeURIComponent(workspaceSlug)}`);

  if (!response.ok) {
    throw new Error((await response.text()).trim() || 'Pinned wardrobe list failed.');
  }

  const payload = pinnedWardrobeListResponseSchema.parse(await response.json());
  return payload.items;
};

export const pinWardrobeItem = async (payload: Record<string, unknown>, fetchImpl: typeof fetch = fetch) => {
  const response = await fetchImpl('/api/wardrobe/pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error((await response.text()).trim() || 'Pinned wardrobe create failed.');
  }

  return pinnedWardrobeItemSchema.parse(await response.json());
};
