import { createTheme } from "@mui/material/styles";

/**
 * Material UI theme.
 *
 * Design decisions:
 * - Light and dark modes follow the operating-system preference
 *   (`colorSchemeSelector: "media"`). With CSS variables the server renders
 *   both schemes and the browser applies the right one before painting —
 *   no light-to-dark "flash".
 * - Buttons are not uppercased: all-caps text is harder to read, especially
 *   for people with dyslexia.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "media" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2563eb" },
        error: { main: "#dc2626" },
        success: { main: "#15803d" },
        background: { default: "#f6f7f9", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#3b82f6" },
        error: { main: "#f87171" },
        success: { main: "#4ade80" },
        background: { default: "#111315", paper: "#1a1d20" },
      },
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: "1.6rem", fontWeight: 700, margin: "28px 0 12px" },
    h2: { fontSize: "1.05rem", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiPaper: { defaultProps: { variant: "outlined" } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
});
