// Vercel Blob helpers. Client-direct uploads (handleUpload signed tokens)
// are wired in lib/blob-upload-route.ts once that ships — Server Actions
// cap at 1MB so large PDFs MUST bypass them.
import { put, del, list, head } from "@vercel/blob";

export { put, del, list, head };

export function assertBlobTokenConfigured(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Run `vercel env pull .env.local` after provisioning Vercel Blob."
    );
  }
}
