import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { isLocale, LOCALE_COOKIE, matchLocale } from "./config";

/**
 * Runs on the server for every request: decides the locale and loads its messages.
 * Priority: the cookie (an explicit choice) > the browser's language > English.
 */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : matchLocale((await headers()).get("accept-language"));

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    // A fixed time zone, so dates rendered on the server and in the browser are identical
    // (avoids hydration mismatches when the server and the user are in different zones).
    timeZone: "America/Sao_Paulo",
  };
});
