import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  "Show me a summary of our current sales metrics and top performing customers",
  "Help with SQL to generate a report",
  "Teach me the concept of game theory in simple terms",
  "Walk me through how to apply for a new role",
];

export default function ChatSuggestions({
  onSuggestionClick,
}: ChatSuggestionsProps) {
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          Hello, Team
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          How can I help you today?
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {suggestions.map((suggestion, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100px",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: (theme) =>
                    `0 4px 20px ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardActionArea
                onClick={() => onSuggestionClick(suggestion)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                >
                  {suggestion}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
