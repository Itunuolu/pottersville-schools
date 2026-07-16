import { env } from "cloudflare:workers";

type PlatformEnv = {
  DB: D1Database;
  LESSON_FILES: R2Bucket;
};

export function getPlatformEnv(): PlatformEnv {
  return env as unknown as PlatformEnv;
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const lower = message.toLowerCase();

  if (lower.includes("no such table")) {
    return Response.json({ error: "The learning workspace is still being prepared. Please try again shortly." }, { status: 503 });
  }

  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export function safeFileName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9._ -]/g, "").trim();
  return cleaned || "lesson-note.pdf";
}
