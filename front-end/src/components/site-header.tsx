"use client";

import AddIcon from "@mui/icons-material/Add";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";

/** Sticky header: brand (link to the list), language picker and a shortcut to create a task. */
export function SiteHeader() {
  const t = useTranslations("header");
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", gap: 1 }}>
          <Box
            component={Link}
            href="/"
            aria-label={t("home")}
            sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0, color: "text.primary", textDecoration: "none" }}
          >
            <TaskAltIcon color="primary" aria-hidden />
            {/* On narrow screens only the icon is shown, so the header fits on a phone. */}
            <Typography component="span" noWrap sx={{ fontWeight: 700, display: { xs: "none", sm: "block" } }}>
              {t("brand")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <LanguageSwitcher />
            <Button component={Link} href="/tasks/new" variant="contained" startIcon={<AddIcon />}>
              {t("newTask")}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
