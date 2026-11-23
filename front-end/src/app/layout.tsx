import Container from "@mui/material/Container";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/toast";
import { AppThemeProvider } from "@/theme/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Technical challenge: Next.js 15 + tRPC with in-memory storage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Collects Material UI (Emotion) styles during SSR and sends them in the HTML. */}
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <AppThemeProvider>
            <TRPCReactProvider>
              <ToastProvider>
                <SiteHeader />
                {/* A narrow column: easier to read for a list of cards and a form. */}
                <Container component="main" maxWidth="md" sx={{ pb: 6 }}>
                  {children}
                </Container>
              </ToastProvider>
            </TRPCReactProvider>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
