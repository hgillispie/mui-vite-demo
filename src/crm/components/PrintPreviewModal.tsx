import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

interface PrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export default function PrintPreviewModal({
  open,
  onClose,
  title,
  content,
}: PrintPreviewModalProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: "Roboto", sans-serif;
                padding: 20px;
                background: white;
              }
              h1 {
                margin-bottom: 20px;
                font-size: 28px;
                font-weight: 600;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f5f5f5;
                font-weight: 600;
                color: #333;
              }
              tr:hover {
                background-color: #f9f9f9;
              }
              .print-header {
                margin-bottom: 30px;
                border-bottom: 2px solid #1976D2;
                padding-bottom: 15px;
              }
              .print-timestamp {
                font-size: 12px;
                color: #666;
                margin-top: 10px;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>${title}</h1>
              <div class="print-timestamp">Printed on: ${new Date().toLocaleString()}</div>
            </div>
            <div id="print-content"></div>
          </body>
        </html>
      `);
      
      const container = printWindow.document.getElementById("print-content");
      if (container) {
        container.innerHTML = content as string;
      }
      
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Print Preview - {title}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#f5f5f5",
          p: 2,
          overflow: "auto",
          maxHeight: "500px",
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            p: 3,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          {content}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          startIcon={<PrintIcon />}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
