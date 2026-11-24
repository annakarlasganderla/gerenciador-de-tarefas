/**
 * Formats a task's creation date in the user's language.
 * The time zone is fixed (and the locale comes from the request) so the HTML
 * rendered on the server (SSR) and in the browser are identical — avoiding
 * hydration mismatches when the server and the user are in different time zones.
 */
const formatters = new Map<string, Intl.DateTimeFormat>();

export function formatDate(date: Date, locale = "en-US") {
  let formatter = formatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });
    formatters.set(locale, formatter);
  }
  return formatter.format(date);
}

/** Maximum number of description characters shown on the task list. */
export const SUMMARY_MAX_LENGTH = 200;

/**
 * Shortens a text to at most `maxLength` characters, cutting at the last
 * space (so words are not split in half) and appending "…".
 */
export function truncate(text: string, maxLength = SUMMARY_MAX_LENGTH) {
  if (text.length <= maxLength) return { text, truncated: false };
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  // If there is no space reasonably close to the end (one huge word), cut hard.
  const base = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return { text: `${base.trimEnd()}…`, truncated: true };
}
