import { LoadingState } from "@/components/feedback";

/** Shown automatically by Next.js while an SSR page is loading. */
export default function Loading() {
  return <LoadingState label="Loading…" />;
}
