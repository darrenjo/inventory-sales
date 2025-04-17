import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Box, Button, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);

  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${dayName}, ${day}/${month}/${year}, ${hours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
};

const PrintableReceipt: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const transaction = location.state?.transaction;

  const handleDownloadPDF = () => {
    if (printRef.current) {
      html2pdf()
        .set({
          margin: 10,
          filename: `Receipt-${transaction.id}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: "mm",
            format: [210, 99], // A4 width, 1/3 height
            orientation: "portrait",
          },
        })
        .from(printRef.current)
        .save();
    }
  };

  if (!transaction) {
    return <div>Transaction not found.</div>;
  }

  return (
    <Box>
      <Button variant="contained" onClick={handleDownloadPDF} sx={{ mb: 2 }}>
        Download Receipt (PDF)
      </Button>

      <Box
        ref={printRef}
        sx={{
          p: 2,
          width: "210mm",
          minHeight: "99mm",
          bgcolor: "#fff",
          color: "#000",
          fontFamily: "monospace",
          fontSize: "11px",
        }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          🧾 Toko Kain Receipt
        </Typography>
        <Typography>ID: {transaction.id}</Typography>
        <Typography>Date: {formatDate(transaction.createdAt)}</Typography>
        <Typography>Staff: {transaction.sales_staff.username}</Typography>
        <Typography>
          Customer: {transaction.customer?.name || "Guest"}
        </Typography>

        <Box my={1}>
          <hr />
          {transaction.TransactionDetails.map((item) => (
            <Box
              key={item.id}
              display="flex"
              justifyContent="space-between"
              mb={0.5}
            >
              <Typography>
                {item.Product.name} ({item.Product.color_code}) x{item.quantity}
              </Typography>
              <Typography>
                Rp. {item.sell_price_at_time.toLocaleString()}
              </Typography>
            </Box>
          ))}
          <hr />
          <Box display="flex" justifyContent="space-between">
            <strong>Total</strong>
            <strong>Rp. {transaction.total_price.toLocaleString()}</strong>
          </Box>
        </Box>

        <Typography align="center" variant="caption">
          Terima kasih telah berbelanja 💖
        </Typography>
      </Box>
    </Box>
  );
};

export default PrintableReceipt;
