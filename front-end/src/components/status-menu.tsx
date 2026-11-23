"use client";

import { TASK_STATUSES, type TaskStatus } from "@task-manager/back-end/schemas";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useId, useState } from "react";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/lib/task-status";
import { StatusDot } from "./status-select";

type Props = {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  /** Task title, used in the accessible name ("In progress — change status of task X"). */
  taskTitle: string;
  /**
   * Blocks changes (e.g. while saving). Uses aria-disabled instead of `disabled`:
   * a disabled button loses focus, leaving keyboard users "lost" on the page.
   */
  disabled?: boolean;
};

/**
 * Task status as a compact "chip" that opens a menu of options.
 *
 * Design decisions:
 * - It sits next to the title: status is the most checked piece of information
 *   on a card, so it can be read at a glance, without a heavy form field.
 * - Color + dot + label: color is never the only way to tell statuses apart.
 * - Accessibility: it is a button with `aria-haspopup`/`aria-expanded`; the
 *   accessible name starts with the visible text ("In progress"), which helps
 *   voice-control users, and says which task will change. MUI's Menu supports
 *   arrow keys, closes with Esc and returns focus to the button.
 */
export function StatusMenu({ value, onChange, taskTitle, disabled }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const open = Boolean(anchor);
  const color = TASK_STATUS_COLORS[value];

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        aria-disabled={disabled}
        onClick={(event) => {
          if (!disabled) setAnchor(event.currentTarget);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${TASK_STATUS_LABELS[value]} — change status of task ${taskTitle}`}
        startIcon={<StatusDot status={value} />}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          borderRadius: 999,
          py: 0.25,
          pl: 1.25,
          pr: 0.75,
          whiteSpace: "nowrap",
          color: "text.primary",
          borderColor: color,
          bgcolor: `color-mix(in srgb, ${color} 14%, transparent)`,
          "& .MuiButton-endIcon": { ml: 0.25 },
          "&:hover": { borderColor: color, bgcolor: `color-mix(in srgb, ${color} 24%, transparent)` },
          "&[aria-disabled='true']": { opacity: 0.6, cursor: "progress" },
        }}
      >
        {TASK_STATUS_LABELS[value]}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {TASK_STATUSES.map((status) => {
          const isCurrent = status === value;
          return (
            <MenuItem
              key={status}
              selected={isCurrent}
              onClick={() => {
                setAnchor(null);
                if (!isCurrent) onChange(status);
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <StatusDot status={status} />
              </ListItemIcon>
              <ListItemText>{TASK_STATUS_LABELS[status]}</ListItemText>
              {/* Visible check mark, besides the highlight color of the current item. */}
              {isCurrent && <CheckIcon fontSize="small" sx={{ ml: 2, color: "text.secondary" }} aria-hidden />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
