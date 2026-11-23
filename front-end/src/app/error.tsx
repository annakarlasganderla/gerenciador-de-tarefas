"use client";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";

/** Error boundary: catches unexpected failures while rendering. */
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Alert
      severity="error"
      sx={{ my: 4 }}
      action={
        <Button color="inherit" size="small" onClick={reset}>
          Try again
        </Button>
      }
    >
      <AlertTitle>Something went wrong</AlertTitle>
      {error.message || "Unexpected error."}
    </Alert>
  );
}
