"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";

/** Centered loading state (spinner + text, announced to screen readers). */
export function LoadingState({ label }: { label: string }) {
  return (
    <Box role="status" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, py: 4 }}>
      <CircularProgress size={22} aria-hidden />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

/** Error state with a "try again" button. */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useTranslations("common");
  return (
    <Alert
      severity="error"
      sx={{ my: 2 }}
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          {t("retry")}
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
