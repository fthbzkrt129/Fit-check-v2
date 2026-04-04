import { z } from "zod";

const garmentCategorySchema = z.enum(["top", "outerwear", "dress", "bottom", "footwear", "accessory"]);
const imageSourceSchema = z.string().trim().min(1, "image must be a non-empty string");

export const modelRequestSchema = z.object({
  userImage: imageSourceSchema
});

export const tryOnRequestSchema = z.object({
  workspaceSlug: z.string().trim().min(1),
  modelImage: imageSourceSchema,
  garmentImage: imageSourceSchema,
  category: garmentCategorySchema
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
  prompt: z.string().trim().min(1)
});

export const aiSuccessSchema = z.object({
  imageUrl: z.string().trim().min(1)
});

export type ModelRequest = z.infer<typeof modelRequestSchema>;
export type TryOnRequest = z.infer<typeof tryOnRequestSchema>;
export type PoseRequest = z.infer<typeof poseRequestSchema>;
export type SceneRequest = z.infer<typeof sceneRequestSchema>;
export type ExperimentalRequest = z.infer<typeof experimentalRequestSchema>;
export type AiSuccessResponse = z.infer<typeof aiSuccessSchema>;
