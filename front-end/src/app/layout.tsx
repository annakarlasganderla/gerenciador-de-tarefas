import Container from "@mui/material/Container";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/toast";
import { AppThemeProvider } from "@/theme/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    // Child pages only set their own name: "New task · Task Manager".
    title: { default: t("appName"), template: `%s · ${t("appName")}` },
    description: t("description"),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The locale is decided per request (cookie or browser language), see src/i18n/request.ts.
  const locale = await getLocale();

  return (
    // `lang` lets screen readers pronounce the content in the right language.
    <html lang={locale}>
      <body>
        {/* Collects Material UI (Emotion) styles during SSR and sends them in the HTML. */}
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <AppThemeProvider>
            {/* Sends the current locale's messages to the Client Components. */}
            <NextIntlClientProvider>
              <TRPCReactProvider>
                <ToastProvider>
                  <SiteHeader />
                  {/* A narrow column: easier to read for a list of cards and a form. */}
                  <Container component="main" maxWidth="md" sx={{ pb: 6 }}>
                    {children}
                  </Container>
                </ToastProvider>
              </TRPCReactProvider>
            </NextIntlClientProvider>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
