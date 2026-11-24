"use client";

import type { Task } from "@task-manager/back-end/schemas";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { StatusDot } from "./status-select";

/** Shows the full task (untruncated description) in a dialog. */
export function TaskDetailsModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <Dialog
      open={task !== null}
      onClose={onClose}
      aria-labelledby="task-modal-title"
      aria-describedby="task-modal-description"
      maxWidth="sm"
      fullWidth
    >
      {task && (
        <>
          <DialogTitle id="task-modal-title" sx={{ overflowWrap: "anywhere" }}>
            {task.title}
          </DialogTitle>
          <DialogContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
              <Chip
                size="small"
                variant="outlined"
                icon={<StatusDot status={task.status} />}
                label={t(`status.${task.status}`)}
                sx={{ pl: 0.75 }}
              />
              <Typography variant="caption" color="text.secondary" component="time" dateTime={task.createdAt.toISOString()}>
                {t("common.createdAt", { date: formatDate(task.createdAt, locale) })}
              </Typography>
            </Stack>
            <Box
              id="task-modal-description"
              sx={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                maxHeight: "60vh",
                overflowY: "auto",
                p: 1.5,
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            >
              {task.description ?? (
                <Typography component="span" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                  {t("common.noDescription")}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button component={Link} href={`/tasks/${task.id}/edit`} startIcon={<EditOutlinedIcon />}>
              {t("common.edit")}
            </Button>
            <Button variant="contained" onClick={onClose} autoFocus>
              {t("common.close")}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
