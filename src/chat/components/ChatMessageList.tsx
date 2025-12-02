import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChatMessage from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
}

export default function ChatMessageList({
  messages,
  isLoading = false,
}: ChatMessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        p: 3,
        minHeight: 0,
      }}
    >
      {messages.length === 0 ? (
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">No messages yet</Typography>
        </Stack>
      ) : (
        <>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
}
