"use client";

import { TASK_STATUSES, type TaskStatus } from "@task-manager/back-end/schemas";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useTranslations } from "next-intl";
import { TASK_STATUS_COLORS } from "@/lib/task-status";

/** Colored dot shown next to the status label (color is never used on its own). */
export function StatusDot({ status }: { status: TaskStatus }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: TASK_STATUS_COLORS[status], flexShrink: 0 }}
    />
  );
}

type Props = {
  id: string;
  label: string;
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

/** Labeled status select, used in the task form. */
export function StatusSelect({ id, label, value, onChange, disabled, fullWidth }: Props) {
  const t = useTranslations("status");
  return (
    <TextField
      select
      id={id}
      size="small"
      label={label}
      value={value}
      disabled={disabled}
      fullWidth={fullWidth}
      onChange={(event) => onChange(event.target.value as TaskStatus)}
      slotProps={{
        select: {
          renderValue: (selected) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StatusDot status={selected as TaskStatus} />
              {t(selected as TaskStatus)}
            </Box>
          ),
        },
      }}
    >
      {TASK_STATUSES.map((status) => (
        <MenuItem key={status} value={status} sx={{ gap: 1 }}>
          <StatusDot status={status} />
          {t(status)}
        </MenuItem>
      ))}
    </TextField>
  );
}
