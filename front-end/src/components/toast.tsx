"use client";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Success/error notifications (toasts) built on Material UI's Snackbar.
 * The provider lives in the root layout, so it survives navigation: a task can
 * be created, the user redirected to the list, and "Task created" still shown.
 *
 * Messages are queued: when a new one arrives while another is visible, the
 * current one closes quickly and the next one appears (MUI's recommended pattern).
 */

type ToastKind = "success" | "error";
type Toast = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<((kind: ToastKind, message: string) => void) | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  // queue[0] is the visible notification; the others wait for their turn.
  const [queue, setQueue] = useState<Toast[]>([]);
  const [open, setOpen] = useState(true);
  const current = queue[0];
  const t = useTranslations("common");

  const show = useCallback((kind: ToastKind, message: string) => {
    setQueue((items) => [...items, { id: nextId++, kind, message }]);
  }, []);

  // Another message arrived: close the current one to make room for the next.
  useEffect(() => {
    if (queue.length > 1) setOpen(false);
  }, [queue.length]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {current && (
        <Snackbar
          key={current.id}
          open={open}
          autoHideDuration={current.kind === "error" ? 6000 : 3500}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          onClose={(_event, reason) => {
            if (reason !== "clickaway") setOpen(false);
          }}
          slotProps={{
            transition: {
              onExited: () => {
                setQueue((items) => items.slice(1));
                setOpen(true);
              },
            },
          }}
        >
          {/* Errors are announced immediately (role="alert"); successes politely. */}
          <Alert
            severity={current.kind}
            variant="filled"
            role={current.kind === "error" ? "alert" : "status"}
            onClose={() => setOpen(false)}
            closeText={t("closeNotification")}
            sx={{ width: "100%", maxWidth: 420 }}
          >
            {current.message}
          </Alert>
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>.");
  return {
    success: (message: string) => show("success", message),
    error: (message: string) => show("error", message),
  };
}
