import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BackToListButton } from "@/components/back-to-list-button";

export default function NotFound() {
  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <Typography variant="h1">Task not found</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The task you are looking for does not exist or has been deleted.
      </Typography>
      <BackToListButton />
    </Box>
  );
}
