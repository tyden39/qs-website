import { randomBytes, createHash } from "crypto";

export interface InviteToken {
  /** Plaintext token — sent in email URL only, never stored in DB. */
  token: string;
  /** SHA-256 hex of token — stored in invite.tokenHash. */
  tokenHash: string;
}

/**
 * Generate a cryptographically secure 256-bit invite token.
 * The plaintext is sent in the email URL; only the hash is persisted.
 */
export function generateInviteToken(): InviteToken {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}
