import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  id: string;
  name: string;
  category: string;
  color_code: string;
  sell_price: number;
}

interface TransactionDetail {
  id: string;
  quantity: number;
  sell_price_at_time: number;
  createdAt: string;
  Product: Product;
}

interface User {
  id: string;
  username?: string;
  name?: string;
}

interface Transaction {
  id: string;
  sales_staff_id: string;
  total_price: number;
  customer_id: string | null;
  discount: number;
  points_earned: number;
  createdAt: string;
  sales_staff: User;
  customer: User | null;
  TransactionDetails: TransactionDetail[];
}

const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`${API_URL}/sales/transactions/${id}`);
        console.log("Transaction Detail Response", res.data);
        setTransaction(res.data);
      } catch (err) {
        console.error("Failed to fetch transaction detail", err);
      }
    };

    fetchTransaction();
  }, [id]);

  if (!transaction) {
    return (
      <Box p={3}>
        <Typography variant="h6">Loading transaction details...</Typography>
      </Box>
    );
  }

  //   const formatDate = (isoDate: string) =>
  //     new Date(isoDate).toLocaleString("en-US");
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

  const handlePrint = () => {
    navigate("/print", { state: { transaction } });
  };

  return (
    <Box p={3}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h5" gutterBottom>
        Transaction Detail
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography>
          <strong>ID:</strong> {transaction.id}
        </Typography>
        <Typography>
          <strong>Date:</strong> {formatDate(transaction.createdAt)}
        </Typography>
        <Typography>
          <strong>Sales Staff:</strong> {transaction.sales_staff.username}
        </Typography>
        <Typography>
          <strong>Customer:</strong>{" "}
          {transaction.customer
            ? transaction.customer.username ||
              transaction.customer.name ||
              `ID: ${transaction.customer_id}`
            : "Guest"}
        </Typography>
        <Typography>
          <strong>Total Price:</strong> Rp{" "}
          {transaction.total_price.toLocaleString()}
        </Typography>
        <Typography>
          <strong>Discount:</strong> {transaction.discount}%
        </Typography>
        <Typography>
          <strong>Points Earned:</strong> {transaction.points_earned}
        </Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Purchased Products
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Product Name</strong>
              </TableCell>
              <TableCell>
                <strong>Color Code</strong>
              </TableCell>
              <TableCell>
                <strong>Quantity</strong>
              </TableCell>
              <TableCell>
                <strong>Sell Price</strong>
              </TableCell>
              <TableCell>
                <strong>Subtotal</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transaction.TransactionDetails.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>{detail.Product.name}</TableCell>
                <TableCell>{detail.Product.color_code}</TableCell>
                <TableCell>{detail.quantity}</TableCell>
                <TableCell>
                  Rp {detail.sell_price_at_time.toLocaleString()}
                </TableCell>
                <TableCell>
                  Rp{" "}
                  {(
                    detail.quantity * detail.sell_price_at_time
                  ).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={handlePrint}>Print Receipt</Button>
    </Box>
  );
};

export default TransactionDetailPage;
