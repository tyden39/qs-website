/**
 * Length limits for the two fields search engines truncate on their own.
 *
 * Google measures pixels, not characters, so these are the conventional
 * character stand-ins for "fits before the cut": roughly 600px of title and
 * ~920px of snippet at desktop widths. Going over does not incur a penalty —
 * the tail is simply dropped from the SERP, and an important qualifier that
 * lands past the cut is a qualifier no searcher ever reads.
 */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/**
 * A share card is not a SERP result: Facebook, Zalo, LinkedIn and X lay the
 * title out over two lines, so they show roughly half again as much as a search
 * listing, and they never append the brand template the `<title>` carries.
 * Budgeting a card against the SERP figure throws away a line of headline for
 * nothing.
 */
const SOCIAL_TITLE_MAX = 88;

/**
 * Trim to `max` characters on a word boundary, appending an ellipsis when
 * anything was actually dropped.
 *
 * The boundary matters: a hard `slice` cuts mid-word ("…đi kèm trọn bộ ser"),
 * which reads as a broken page rather than a truncated one. Falls back to a
 * hard cut when the text has no space inside the budget (a single long token),
 * since there is no boundary to honour there.
 */
function truncateAtWord(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  // Reserve one character for the ellipsis so the result never exceeds `max`.
  const budget = trimmed.slice(0, max - 1);
  const lastSpace = budget.lastIndexOf(" ");
  const cut = lastSpace > 0 ? budget.slice(0, lastSpace) : budget;
  // Drop trailing punctuation so the ellipsis does not follow a comma or dash.
  return `${cut.replace(/[\s,;:–—-]+$/, "")}…`;
}

/**
 * The locale layout renders every page title through the `%s | QS Technology`
 * template, so the brand suffix is part of what a SERP measures. Budgeting the
 * page's own portion against `TITLE_MAX` alone would put the rendered title 16
 * characters over the cut — enough to lose the brand, which is the part most
 * worth keeping intact on a news headline.
 */
const BRAND_SUFFIX = " | QS Technology";

/**
 * Title for the `<title>` tag and OG/Twitter title, trimmed so the rendered
 * title — this text *plus* the brand suffix — stays inside the SERP budget.
 *
 * Long editorial headlines (some news titles run past 190 characters) are the
 * reason this exists. The on-page <h1> still carries the full headline, so
 * nothing is lost to the reader.
 */
export function seoTitle(text: string, max: number = TITLE_MAX - BRAND_SUFFIX.length): string {
  return truncateAtWord(text, max);
}

/**
 * Title for the OG/Twitter card. Same headline, longer leash — the card has no
 * brand suffix to make room for and wraps onto a second line.
 */
export function socialTitle(text: string, max: number = SOCIAL_TITLE_MAX): string {
  return truncateAtWord(text, max);
}

/** Description for the meta description, OG/Twitter description and JSON-LD. */
export function seoDescription(text: string, max: number = DESCRIPTION_MAX): string {
  return truncateAtWord(text, max);
}
