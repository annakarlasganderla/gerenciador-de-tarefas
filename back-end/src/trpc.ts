import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

/**
 * Per-request context. There is no authentication or database in this
 * challenge, so it is empty — keeping the function makes it easy to extend.
 */
export const createTRPCContext = async () => ({});

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  // superjson keeps `Date` values (createdAt) as real dates across the wire.
  transformer: superjson,
  /**
   * Zod validation errors are returned in a structured way
   * (`data.zodError.fieldErrors`), so the form can show the server message
   * next to the right field.
   */
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null;
    return {
      ...shape,
      // By default the message would be the raw JSON of the issues; use readable text instead.
      message: zodError ? zodError.issues.map((issue) => issue.message).join(" ") : shape.message,
      data: {
        ...shape.data,
        zodError: zodError ? z.flattenError(zodError) : null,
      },
    };
  },
});

/**
 * Artificial latency in development only, so the UI loading states are
 * visible (the in-memory store responds instantly). Disable with TRPC_DELAY_MS=0.
 */
const artificialDelay = t.middleware(async ({ next }) => {
  const ms = Number(process.env.TRPC_DELAY_MS ?? (process.env.NODE_ENV === "development" ? 400 : 0));
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
  return next();
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure.use(artificialDelay);
