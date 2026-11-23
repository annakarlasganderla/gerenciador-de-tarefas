"use client";

import AddIcon from "@mui/icons-material/Add";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";

/** Sticky header: brand (link to the list) and a shortcut to create a task. */
export function SiteHeader() {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", gap: 2 }}>
          <Box
            component={Link}
            href="/"
            sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.primary", textDecoration: "none" }}
          >
            <TaskAltIcon color="primary" aria-hidden />
            <Typography component="span" sx={{ fontWeight: 700 }}>
              Task Manager
            </Typography>
          </Box>
          <Button component={Link} href="/tasks/new" variant="contained" startIcon={<AddIcon />}>
            New task
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
