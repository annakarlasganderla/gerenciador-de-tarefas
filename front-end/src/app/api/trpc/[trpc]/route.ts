/**
 * API mount point: all logic lives in back-end/.
 * Next.js only forwards /api/trpc/* requests to the tRPC handler.
 */
export { handler as GET, handler as POST } from "@task-manager/back-end/http";
