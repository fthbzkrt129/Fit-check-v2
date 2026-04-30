import { z } from "zod";

const garmentCategorySchema = z.enum(["top", "outerwear", "dress", "bottom", "footwear", "accessory"]);
const imageSourceSchema = z.string().trim().regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "image must be a base64 data URL");
const topLengthSchema = z.enum(["crop", "waist", "hip", "tunic"]);
const dressLengthSchema = z.enum(["knee", "midi", "maxi", "floor"]);
const outerwearLengthSchema = z.enum(["short", "medium", "long"]);

export const modelRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  userImage: imageSourceSchema
});

export const modelIdentityReferenceRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  operation: z.literal('identity-reference'),
  userImage: imageSourceSchema,
});

export const modelSwapRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  operation: z.literal('swap'),
  referenceLookImage: imageSourceSchema,
  identityReferenceImage: imageSourceSchema,
});

export const secureModelRequestSchema = z.union([
  modelRequestSchema,
  modelIdentityReferenceRequestSchema,
  modelSwapRequestSchema,
]);

export const tryOnRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  modelImage: imageSourceSchema,
  garmentImage: imageSourceSchema,
  category: garmentCategorySchema,
  topLength: topLengthSchema.nullish(),
  dressLength: dressLengthSchema.nullish(),
  outerwearLength: outerwearLengthSchema.nullish(),
}).superRefine((payload, ctx) => {
  const hasTopLength = payload.topLength != null;
  const hasDressLength = payload.dressLength != null;
  const hasOuterwearLength = payload.outerwearLength != null;

  if (payload.category === 'top') {
    if (!hasTopLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'topLength is required for top try-on requests.', path: ['topLength'] });
    }
    if (hasDressLength || hasOuterwearLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Only topLength is allowed for top try-on requests.', path: ['category'] });
    }
  }

  if (payload.category === 'dress') {
    if (!hasDressLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'dressLength is required for dress try-on requests.', path: ['dressLength'] });
    }
    if (hasTopLength || hasOuterwearLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Only dressLength is allowed for dress try-on requests.', path: ['category'] });
    }
  }

  if (payload.category === 'outerwear') {
    if (!hasOuterwearLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'outerwearLength is required for outerwear try-on requests.', path: ['outerwearLength'] });
    }
    if (hasTopLength || hasDressLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Only outerwearLength is allowed for outerwear try-on requests.', path: ['category'] });
    }
  }

  if (payload.category === 'bottom' || payload.category === 'footwear' || payload.category === 'accessory') {
    if (hasTopLength || hasDressLength || hasOuterwearLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'No length controls are allowed for this category.', path: ['category'] });
    }
  }
});

export const poseRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  tryOnImage: imageSourceSchema,
  poseInstruction: z.string().trim().min(1)
});

export const sceneRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  baseImage: imageSourceSchema,
  scene: z.enum(["studio", "cafe", "street", "luxury room"]),
  lighting: z.enum(["soft daylight", "golden hour", "dramatic", "editorial"]),
  mode: z.enum(["fast", "pro"]).default("fast"),
  customPrompt: z.string().trim().optional()
});

export const experimentalRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  baseModelImage: imageSourceSchema,
  imageInputs: z.array(imageSourceSchema).min(1),
  garments: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        name: z.string().trim().min(1),
        category: garmentCategorySchema,
        imageIndex: z.number().int().min(0)
      })
    )
    .min(1),
  finalSceneDescription: z.string().trim().optional(),
  prompt: z.string().trim().min(1),
  provider: z.literal('gpt-image-2').optional(),
  imageSize: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }).optional(),
  quality: z.enum(['low', 'high']).optional(),
  maxQueueStatusPolls: z.number().int().positive().optional(),
}).superRefine((payload, ctx) => {
  payload.garments.forEach((garment, index) => {
    if (garment.imageIndex < 2 || garment.imageIndex > payload.imageInputs.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'garment imageIndex must reference an existing image input after the base model image.',
        path: ['garments', index, 'imageIndex'],
      });
    }
  });
});

export const aiSuccessSchema = z.object({
  imageUrl: z.string().trim().min(1)
});

export type ModelRequest = z.infer<typeof modelRequestSchema>;
export type ModelIdentityReferenceRequest = z.infer<typeof modelIdentityReferenceRequestSchema>;
export type ModelSwapRequest = z.infer<typeof modelSwapRequestSchema>;
export type SecureModelRequest = z.infer<typeof secureModelRequestSchema>;
export type TryOnRequest = z.infer<typeof tryOnRequestSchema>;
export type PoseRequest = z.infer<typeof poseRequestSchema>;
export type SceneRequest = z.infer<typeof sceneRequestSchema>;
export type ExperimentalRequest = z.infer<typeof experimentalRequestSchema>;
export type AiSuccessResponse = z.infer<typeof aiSuccessSchema>;
