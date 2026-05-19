/**
 * Central source of truth for invite URL construction.
 * Both the email template and the accept-invite route import from here
 * so the path never drifts between what's emailed and what's served.
 */
export function buildInviteUrl(
  email: string,
  token: string,
  locale: string = "vi",
): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const params = new URLSearchParams({ token, email });
  return `${base}/${locale}/accept-invite?${params.toString()}`;
}
