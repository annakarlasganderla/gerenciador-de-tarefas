"use client";

import CheckIcon from "@mui/icons-material/Check";
import TranslateIcon from "@mui/icons-material/Translate";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { setUserLocale } from "@/i18n/actions";
import { LOCALE_NAMES, LOCALE_SHORT_NAMES, LOCALES, type Locale } from "@/i18n/config";

/**
 * Language picker in the header.
 * Saves the choice in a cookie (Server Action) and re-renders the Server
 * Components, so server and client texts change together — without a full reload
 * and without losing the data already loaded (React Query cache).
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("header");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const open = Boolean(anchor);

  function choose(next: Locale) {
    setAnchor(null);
    if (next === locale) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        color="inherit"
        startIcon={<TranslateIcon />}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t("language", { language: LOCALE_NAMES[locale] })}
        aria-busy={isPending}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ minWidth: 0, opacity: isPending ? 0.6 : 1 }}
      >
        {LOCALE_SHORT_NAMES[locale]}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {LOCALES.map((option) => (
          // `lang` makes screen readers pronounce each name in its own language.
          <MenuItem key={option} lang={option} selected={option === locale} onClick={() => choose(option)}>
            <ListItemText>{LOCALE_NAMES[option]}</ListItemText>
            {option === locale && <CheckIcon fontSize="small" sx={{ ml: 2, color: "text.secondary" }} aria-hidden />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
