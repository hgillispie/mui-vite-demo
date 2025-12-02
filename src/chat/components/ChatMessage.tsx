import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isLoading = false,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          maxWidth: "70%",
          px: 2,
          py: 1.5,
          backgroundColor: isUser
            ? theme.palette.primary.main
            : theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        })}
      >
        {isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={16} />
            <Typography
              variant="body2"
              sx={{ color: isUser ? "common.white" : "text.primary" }}
            >
              Processing...
            </Typography>
          </Stack>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: isUser ? "common.white" : "text.primary" }}
          >
            {content}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
