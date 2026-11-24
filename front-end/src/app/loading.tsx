import { getTranslations } from "next-intl/server";
import { LoadingState } from "@/components/feedback";

/** Shown automatically by Next.js while an SSR page is loading. */
export default async function Loading() {
  const t = await getTranslations("common");
  return <LoadingState label={t("loading")} />;
}
