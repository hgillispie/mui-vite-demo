import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface Suggestion {
  id: string;
  text: string;
  description: string;
  icon: string;
}

interface ChatSuggestionsProps {
  onSelectSuggestion: (text: string) => void;
}

const suggestions: Suggestion[] = [
  {
    id: "1",
    text: "What are our top 3 customers by deal value?",
    description: "See your highest value customers",
    icon: "📊",
  },
  {
    id: "2",
    text: "Show me deals closing soon",
    description: "Get deals that are about to close",
    icon: "📈",
  },
  {
    id: "3",
    text: "What's our current pipeline status?",
    description: "View overall pipeline analysis",
    icon: "🎯",
  },
  {
    id: "4",
    text: "Tell me about at-risk customers",
    description: "Identify customers needing attention",
    icon: "⚠️",
  },
];

export default function ChatSuggestions({
  onSelectSuggestion,
}: ChatSuggestionsProps) {
  return (
    <Box sx={{ width: "100%", px: 2, py: 4 }}>
      <Stack spacing={3} alignItems="center">
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          How can I help you today?
        </Typography>

        <Grid container spacing={2} sx={{ width: "100%", maxWidth: 800 }}>
          {suggestions.map((suggestion) => (
            <Grid item xs={12} sm={6} key={suggestion.id}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => onSelectSuggestion(suggestion.text)}
                  sx={{ p: 2, height: "100%" }}
                >
                  <Stack spacing={1}>
                    <Box sx={{ fontSize: 24 }}>{suggestion.icon}</Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {suggestion.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {suggestion.description}
                    </Typography>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
