import { z, type ZodIssue } from "zod";

const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().trim().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required.")
});

const publicEnvSchema = supabasePublicEnvSchema.extend({
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().trim().min(1, "NEXT_PUBLIC_ROOT_DOMAIN is required.")
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1, "SUPABASE_SERVICE_ROLE_KEY is required."),
  GEMINI_API_KEY: z.string().trim().min(1, "GEMINI_API_KEY is required."),
  FAL_KEY: z.string().trim().min(1, "FAL_KEY is required.")
});

type PublicEnvInput = Partial<Record<keyof z.infer<typeof publicEnvSchema>, string | undefined>>;
type SupabasePublicEnvInput = Partial<Record<keyof z.infer<typeof supabasePublicEnvSchema>, string | undefined>>;
type ServerEnvInput = Partial<Record<keyof z.infer<typeof serverEnvSchema>, string | undefined>>;

const readSupabasePublicEnv = (): SupabasePublicEnvInput => ({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

const readPublicEnv = (): PublicEnvInput => ({
  ...readSupabasePublicEnv(),
  NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN
});

const readServerEnv = (): ServerEnvInput => ({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  FAL_KEY: process.env.FAL_KEY
});

const getMissingKeys = (issues: ZodIssue[]) => {
  return Array.from(
    new Set(
      issues
        .map((issue) => issue.path[0])
        .filter((key): key is string => typeof key === "string")
    )
  );
};

const buildEnvError = (scope: string, issues: ZodIssue[]) => {
  const missingKeys = getMissingKeys(issues);
  const issueMessages = issues.map((issue) => issue.message).join(" ");

  return new Error(
    `Invalid ${scope} environment configuration. Missing or invalid: ${missingKeys.join(", ")}. ${issueMessages}`
  );
};

export const getSupabasePublicEnv = (input: SupabasePublicEnvInput = readSupabasePublicEnv()) => {
  const parsed = supabasePublicEnvSchema.safeParse(input);

  if (!parsed.success) {
    throw buildEnvError("public", parsed.error.issues);
  }

  return {
    supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
};

export const getPublicEnv = (input: PublicEnvInput = readPublicEnv()) => {
  const parsed = publicEnvSchema.safeParse(input);

  if (!parsed.success) {
    throw buildEnvError("public", parsed.error.issues);
  }

  return {
    supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    rootDomain: parsed.data.NEXT_PUBLIC_ROOT_DOMAIN
  };
};

export const getServerEnv = (input: ServerEnvInput = readServerEnv()) => {
  const parsed = serverEnvSchema.safeParse(input);

  if (!parsed.success) {
    throw buildEnvError("server", parsed.error.issues);
  }

  return {
    supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    geminiApiKey: parsed.data.GEMINI_API_KEY,
    falKey: parsed.data.FAL_KEY
  };
};
