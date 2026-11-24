"use client";

import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  VALIDATION_MESSAGES,
  type ValidationMessageKey,
} from "@task-manager/back-end/schemas";
import { useTranslations } from "next-intl";

/** Validation message (English, as written by the back-end) → translation key. */
const KEY_BY_MESSAGE = new Map(
  Object.entries(VALIDATION_MESSAGES).map(([key, message]) => [message as string, key as ValidationMessageKey]),
);

/** The parts of a tRPC client error that matter here. */
type ApiError = {
  message: string;
  data?: {
    code?: string;
    zodError?: { formErrors: string[]; fieldErrors: Record<string, string[] | undefined> } | null;
  } | null;
};

/**
 * Translates error messages into the user's language.
 *
 * Design decision: the back-end (the API) always answers in English. Instead of
 * making the API locale-aware, the front-end recognizes the known messages
 * (shared through `VALIDATION_MESSAGES`) and error codes (e.g. NOT_FOUND) and
 * shows their translation. Unknown messages are shown as they are.
 */
export function useErrorMessage() {
  const t = useTranslations("errors");

  /** Translates one validation message (from the shared Zod schemas). */
  function validation(message: string) {
    const key = KEY_BY_MESSAGE.get(message);
    switch (key) {
      case undefined:
        return message;
      case "titleTooLong":
        return t(key, { max: TITLE_MAX_LENGTH });
      case "descriptionTooLong":
        return t(key, { max: DESCRIPTION_MAX_LENGTH });
      default:
        return t(key);
    }
  }

  /** Translates an error returned by a tRPC call. */
  function api(error: ApiError) {
    if (error.data?.code === "NOT_FOUND") return t("taskNotFound");

    const zodError = error.data?.zodError;
    if (zodError) {
      const messages = [...zodError.formErrors, ...Object.values(zodError.fieldErrors).flatMap((list) => list ?? [])];
      if (messages.length > 0) return messages.map(validation).join(" ");
    }
    return error.message ? validation(error.message) : t("unexpected");
  }

  return { validation, api };
}
