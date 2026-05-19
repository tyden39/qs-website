import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require";

const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// Issues a signed token so the browser can stream the file directly to
// Vercel Blob. Server Action body limit (1MB) would otherwise truncate
// PDFs and Tiptap images. Magic-byte verification happens in
// onUploadCompleted once the blob is in place.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await requireRole(["admin", "editor"]);
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Magic-byte verification + audit logging are wired by the streams
        // that own the entity (datasheets, news cover images, product photos).
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    if (err instanceof Response) {
      return err;
    }
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
