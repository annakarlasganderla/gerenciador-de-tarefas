"use client";

import {
  createTaskSchema,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  type Task,
  type TaskStatus,
} from "@task-manager/back-end/schemas";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { StatusSelect } from "@/components/status-select";
import { useToast } from "@/components/toast";
import { useErrorMessage } from "@/i18n/use-error-message";
import { useTRPC } from "@/trpc/client";

type FieldErrors = { title?: string; description?: string };

/**
 * A single form to create (without `task`) or edit (with `task`) a task.
 * Local state with useState; validation uses the SAME Zod schema as the back-end
 * (its English messages are translated with `useErrorMessage`).
 */
export function TaskFormView({ task }: { task?: Task }) {
  const isEditing = Boolean(task);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const toast = useToast();
  const t = useTranslations("taskForm");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "not_started");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Callbacks shared by create and update.
  const callbacks = {
    onSuccess: async (saved: Task) => {
      // Invalidate the list so it reflects the change when the user goes back.
      await queryClient.invalidateQueries(trpc.task.pathFilter());
      toast.success(t(isEditing ? "updated" : "created", { title: saved.title }));
      router.push("/");
    },
    onError: (error: {
      message: string;
      data?: {
        code?: string;
        zodError: { formErrors: string[]; fieldErrors: Record<string, string[] | undefined> } | null;
      } | null;
    }) => {
      // Validation errors coming from the back-end are shown (translated) next to the matching field.
      const fieldErrors = error.data?.zodError?.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setErrors({ title: translate(fieldErrors.title?.[0]), description: translate(fieldErrors.description?.[0]) });
        setFormError(t("fixHighlightedFields"));
      } else {
        setFormError(errorMessage.api(error));
      }
      toast.error(t("saveFailed", { message: errorMessage.api(error) }));
    },
  };

  /** Translates an optional validation message. */
  function translate(message: string | undefined) {
    return message === undefined ? undefined : errorMessage.validation(message);
  }

  const createTask = useMutation(trpc.task.create.mutationOptions(callbacks));
  const updateTask = useMutation(trpc.task.update.mutationOptions(callbacks));
  const isSaving = createTask.isPending || updateTask.isPending;

  function validateField(field: keyof FieldErrors, value: string) {
    const result = createTaskSchema.shape[field].safeParse(value);
    setErrors((current) => ({ ...current, [field]: result.success ? undefined : translate(result.error.issues[0]?.message) }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Front-end validation: blocks the submission when there are errors (e.g. an empty title).
    const result = createTaskSchema.safeParse({ title, description, status });
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({ title: translate(fieldErrors.title?.[0]), description: translate(fieldErrors.description?.[0]) });
      return;
    }
    setErrors({});

    if (task) {
      updateTask.mutate({ id: task.id, ...result.data });
    } else {
      createTask.mutate(result.data);
    }
  }

  /** Helper text: the field error (if any) on the left and a character counter on the right. */
  const helper = (error: string | undefined, length: number, max: number) => (
    <Box component="span" sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <span>{error ?? ""}</span>{" "}
      <Box component="span" sx={{ color: "text.secondary", flexShrink: 0 }}>
        {length}/{max}
      </Box>
    </Box>
  );

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2.5}>
        {formError && <Alert severity="error">{formError}</Alert>}

        {/* TextField already wires the label, helper text (aria-describedby) and error state (aria-invalid). */}
        <TextField
          id="title"
          name="title"
          label={t("titleLabel")}
          required
          autoFocus
          fullWidth
          value={title}
          disabled={isSaving}
          error={Boolean(errors.title)}
          placeholder={t("titlePlaceholder")}
          helperText={helper(errors.title, title.length, TITLE_MAX_LENGTH)}
          slotProps={{ htmlInput: { maxLength: TITLE_MAX_LENGTH } }}
          onChange={(event) => {
            setTitle(event.target.value);
            if (errors.title) validateField("title", event.target.value);
          }}
          onBlur={(event) => validateField("title", event.target.value)}
        />

        <TextField
          id="description"
          name="description"
          label={t("descriptionLabel")}
          multiline
          minRows={5}
          fullWidth
          value={description}
          disabled={isSaving}
          error={Boolean(errors.description)}
          placeholder={t("descriptionPlaceholder")}
          helperText={helper(errors.description, description.length, DESCRIPTION_MAX_LENGTH)}
          slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX_LENGTH } }}
          onChange={(event) => {
            setDescription(event.target.value);
            if (errors.description) validateField("description", event.target.value);
          }}
        />

        <StatusSelect id="status" label={t("statusLabel")} value={status} onChange={setStatus} disabled={isSaving} fullWidth />

        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button component={Link} href="/" disabled={isSaving}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={isSaving}
            loadingPosition="start"
            startIcon={<SaveOutlinedIcon />}
          >
            {isSaving ? tCommon("saving") : isEditing ? t("save") : t("create")}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
