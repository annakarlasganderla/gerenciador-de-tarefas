import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { TaskFormView } from "@/views/task-form/task-form-view";

export const metadata: Metadata = { title: "New task · Task Manager" };

export default function NewTaskPage() {
  return (
    <>
      <Typography variant="h1">New task</Typography>
      <TaskFormView />
    </>
  );
}
