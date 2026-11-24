import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TaskFormView } from "@/views/task-form/task-form-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("newTask") };
}

export default async function NewTaskPage() {
  const t = await getTranslations("metadata");
  return (
    <>
      <Typography variant="h1">{t("newTask")}</Typography>
      <TaskFormView />
    </>
  );
}
