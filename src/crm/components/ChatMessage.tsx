import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import SmartToyIcon from "@mui/icons-material/SmartToy";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
}: ChatMessageProps) {
  const isUser = role === "user";

  const formatTime = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        justifyContent: isUser ? "flex-end" : "flex-start",
        width: "100%",
        mb: 2,
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: "primary.main",
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          <SmartToyIcon sx={{ fontSize: 18 }} />
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        <Paper
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: isUser ? "primary.main" : "action.hover",
            color: isUser ? "primary.contrastText" : "text.primary",
            borderRadius: 2,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
          elevation={0}
        >
          <Typography variant="body2">{content}</Typography>
        </Paper>
        {timestamp && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              mt: 0.5,
              px: 1,
            }}
          >
            {formatTime(timestamp)}
          </Typography>
        )}
      </Box>

      {isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: "secondary.main",
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          U
        </Avatar>
      )}
    </Stack>
  );
}
