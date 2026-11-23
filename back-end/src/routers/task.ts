import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { changeStatusSchema, createTaskSchema, idSchema, listTasksSchema, updateTaskSchema } from "../schemas";
import { taskStore } from "../store";
import { createTRPCRouter, publicProcedure } from "../trpc";

function notFound(id: string): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Task with id "${id}" was not found. It may have been deleted.`,
  });
}

/**
 * Task CRUD router.
 * Every input is validated by Zod before reaching the handler: invalid
 * requests (e.g. an empty title) automatically return BAD_REQUEST.
 */
export const taskRouter = createTRPCRouter({
  /** Cursor-paginated list (compatible with useInfiniteQuery). */
  list: publicProcedure.input(listTasksSchema).query(({ input }) => {
    return taskStore.list(input);
  }),

  getById: publicProcedure.input(z.object({ id: idSchema })).query(({ input }) => {
    return taskStore.getById(input.id) ?? notFound(input.id);
  }),

  create: publicProcedure.input(createTaskSchema).mutation(({ input }) => {
    return taskStore.create(input);
  }),

  update: publicProcedure.input(updateTaskSchema).mutation(({ input }) => {
    const { id, ...data } = input;
    return taskStore.update(id, data) ?? notFound(id);
  }),

  changeStatus: publicProcedure.input(changeStatusSchema).mutation(({ input }) => {
    return taskStore.changeStatus(input.id, input.status) ?? notFound(input.id);
  }),

  delete: publicProcedure.input(z.object({ id: idSchema })).mutation(({ input }) => {
    return taskStore.delete(input.id) ?? notFound(input.id);
  }),
});
