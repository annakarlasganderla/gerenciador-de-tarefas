"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

/** Applies the Material UI theme to the whole app. */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      {/* Style reset + native `color-scheme` (scrollbars and inputs follow the theme). */}
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
