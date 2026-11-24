import type messages from "./messages/en.json";
import type { Locale } from "./config";

/**
 * Types next-intl with the English messages: a typo in a key (`t("taskList.titel")`)
 * becomes a TypeScript error instead of showing a raw key on screen.
 * The test `messages.test.ts` checks that pt-BR has exactly the same keys.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
