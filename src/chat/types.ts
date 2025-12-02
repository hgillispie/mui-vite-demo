export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatApiRequest {
  messages: ChatMessage[];
  system?: string;
  max_tokens?: number;
}

export interface ChatApiResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ChatSuggestion {
  text: string;
  icon?: React.ReactNode;
}
