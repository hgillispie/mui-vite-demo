import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import ChatMessage from "./components/ChatMessage";
import ChatMessageList from "./components/ChatMessageList";
import ChatInput from "./components/ChatInput";
import ChatSuggestions from "./components/ChatSuggestions";
import type { ChatMessage as ChatMessageType, ChatApiResponse } from "./types";

const CRM_API_BASE = "https://crm-api-production.up.railway.app/api";

async function callChatApi(messages: ChatMessageType[]): Promise<string> {
  const response = await fetch(`${CRM_API_BASE}/chat/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusCode}`);
  }

  const data: ChatApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to get response");
  }

  return data.content || "";
}

export default function ChatBot() {
  const [messages, setMessages] = React.useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSendMessage = React.useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setError(null);

    const newMessages: ChatMessageType[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await callChatApi(newMessages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get response from API"
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, inputValue, isLoading]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: { sm: "100%", md: "800px" },
        mx: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {messages.length === 0 ? (
        <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
      ) : (
        <ChatMessageList messages={messages} isLoading={isLoading} />
      )}

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        isLoading={isLoading}
      />
    </Stack>
  );
}
