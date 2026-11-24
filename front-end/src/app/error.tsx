"use client";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import { useTranslations } from "next-intl";

/** Error boundary: catches unexpected failures while rendering. */
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations();
  return (
    <Alert
      severity="error"
      sx={{ my: 4 }}
      action={
        <Button color="inherit" size="small" onClick={reset}>
          {t("common.retry")}
        </Button>
      }
    >
      <AlertTitle>{t("errors.somethingWentWrong")}</AlertTitle>
      {error.message || t("errors.unexpected")}
    </Alert>
  );
}
