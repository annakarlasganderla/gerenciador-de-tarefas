import Typography from "@mui/material/Typography";
import { TRPCError } from "@trpc/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { caller } from "@/trpc/server";
import { TaskFormView } from "@/views/task-form/task-form-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("editTask") };
}

/**
 * The task is loaded on the server (SSR), so the form opens already filled in.
 * If the id does not exist (or is invalid), the 404 page is shown.
 */
export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("metadata");

  let task;
  try {
    task = await caller.task.getById({ id });
  } catch (error) {
    if (error instanceof TRPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) {
      notFound();
    }
    throw error;
  }

  return (
    <>
      <Typography variant="h1">{t("editTask")}</Typography>
      <TaskFormView task={task} />
    </>
  );
}
