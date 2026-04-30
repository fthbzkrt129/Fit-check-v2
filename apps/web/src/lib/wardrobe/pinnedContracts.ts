import { z } from 'zod';

const categorySchema = z.enum(['top', 'outerwear', 'dress', 'bottom', 'footwear', 'accessory']);
const imageSourceSchema = z.string().trim().regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,/);

export const pinnedWardrobeItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1),
  category: categorySchema,
  source: z.enum(['system', 'user']),
  isPinned: z.literal(true),
});

export const listPinnedWardrobeQuerySchema = z.object({
  workspaceSlug: z.string().trim().min(1),
});

export const pinWardrobeRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: categorySchema,
  sourceKind: z.enum(['uploaded', 'system']),
  imageDataUrl: imageSourceSchema.optional(),
  sourceUrl: z.string().trim().min(1).optional(),
  systemItemId: z.string().trim().min(1).optional(),
}).superRefine((value, ctx) => {
  if (value.sourceKind === 'uploaded' && !value.imageDataUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'imageDataUrl is required for uploaded items', path: ['imageDataUrl'] });
  }

  if (value.sourceKind === 'system' && !value.sourceUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'sourceUrl is required for system items', path: ['sourceUrl'] });
  }
});

export const pinnedWardrobeListResponseSchema = z.object({
  items: z.array(pinnedWardrobeItemSchema),
});

export type PinnedWardrobeItem = z.infer<typeof pinnedWardrobeItemSchema>;
export type PinWardrobeRequest = z.infer<typeof pinWardrobeRequestSchema>;
