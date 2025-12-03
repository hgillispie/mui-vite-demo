import * as React from "react";
import { useLocation } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PrintIcon from "@mui/icons-material/Print";
import MenuButton from "../../dashboard/components/MenuButton";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import CrmSearch from "./CrmSearch";
import CrmNavbarBreadcrumbs from "./CrmNavbarBreadcrumbs";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PrintPreviewModal from "./PrintPreviewModal";

function getPageTitle(pathname: string): string {
  if (pathname === "/" || pathname === "") return "CRM Dashboard";
  const path = pathname.split("/").filter((x) => x)[0];
  const titleMap: Record<string, string> = {
    customers: "Customers",
    deals: "Deals",
    contacts: "Contacts",
    tasks: "Tasks",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
    chatbot: "Chatbot",
  };
  return titleMap[path] || "CRM App";
}

export default function CrmHeader() {
  const location = useLocation();
  const [printOpen, setPrintOpen] = React.useState(false);
  const [printContent, setPrintContent] = React.useState<string>("");
  const pageTitle = getPageTitle(location.pathname);

  const handlePrintClick = () => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      const clonedContent = mainContent.cloneNode(true) as HTMLElement;
      clonedContent.style.display = "block";
      setPrintContent(clonedContent.innerHTML);
      setPrintOpen(true);
    }
  };
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <Stack direction="column" spacing={1}>
        <CrmNavbarBreadcrumbs />
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: "34px", fontWeight: 700, lineHeight: "36px" }}
        >
          <p>{pageTitle}</p>
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ gap: 1 }}>
        <CrmSearch />
        <Button
          variant="outlined"
          size="small"
          startIcon={<CalendarTodayRoundedIcon />}
        >
          This Month
        </Button>
        <IconButton
          onClick={handlePrintClick}
          title="Print Preview"
          size="small"
          sx={{ color: "action.active" }}
        >
          <PrintIcon />
        </IconButton>
        <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>

      <PrintPreviewModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        title={pageTitle}
        content={<div dangerouslySetInnerHTML={{ __html: printContent }} />}
      />
    </Stack>
  );
}
