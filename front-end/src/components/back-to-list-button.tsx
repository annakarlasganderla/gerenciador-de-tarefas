"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import Link from "next/link";

/** "Back to the list" button (a Client Component, since it passes Next's `Link` to Material UI). */
export function BackToListButton() {
  return (
    <Button component={Link} href="/" variant="contained" startIcon={<ArrowBackIcon />}>
      Back to the list
    </Button>
  );
}
