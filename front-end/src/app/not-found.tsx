import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getTranslations } from "next-intl/server";
import { BackToListButton } from "@/components/back-to-list-button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <Typography variant="h1">{t("title")}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("message")}
      </Typography>
      <BackToListButton />
    </Box>
  );
}
