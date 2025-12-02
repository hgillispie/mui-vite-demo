import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          placeholder="Enter a prompt here"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          multiline
          maxRows={4}
          minRows={1}
          size="small"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <IconButton
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          color="primary"
          sx={{
            mt: "8px",
          }}
        >
          <SendRoundedIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}
