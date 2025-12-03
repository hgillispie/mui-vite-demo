import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import ChatSuggestions from "../components/ChatSuggestions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export default function Chatbot() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    setError(null);

    // Add user message to conversation
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Prepare messages for API call
      const apiMessages = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call CRM API chat endpoint
      const response = await fetch(
        "https://crm-api-production.up.railway.app/api/chat/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            max_tokens: 1024,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response from chatbot");
      }

      // Add assistant message to conversation
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content || "No response received",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Card
        variant="outlined"
        sx={{
          height: { xs: "calc(100vh - 180px)", md: "calc(100vh - 220px)" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            p: 3,
            backgroundColor: "background.default",
          }}
        >
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Empty State with Suggestions */}
          {messages.length === 0 && !isLoading && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
              <ChatSuggestions onSelectSuggestion={handleSuggestionClick} />
            </Box>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ width: 32, height: 32 }} />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={24} />
              </Box>
            </Stack>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={false}
        />
      </Card>
    </Box>
  );
}
