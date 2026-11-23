"use client";

import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type Props = {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive (red) style for actions such as deleting. */
  danger?: boolean;
  /** Shows a loading state and prevents closing while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Reusable confirmation dialog, replacing the browser's `window.confirm`.
 * MUI's Dialog already handles focus trapping, Esc, the inert background and
 * returning focus to the element that opened it.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-message" component="div">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {/* Initial focus on "Cancel": prevents confirming a destructive action with an accidental Enter. */}
        <Button onClick={onCancel} disabled={loading} autoFocus>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={danger ? "error" : "primary"}
          onClick={onConfirm}
          loading={loading}
          loadingPosition="start"
          startIcon={danger ? <DeleteOutlineOutlinedIcon /> : <CheckIcon />}
        >
          {loading ? "Please wait…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
