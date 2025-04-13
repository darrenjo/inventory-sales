import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridValueGetter } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

interface Transaction {
  id: string;
  sales_staff_id: string;
  total_price: number;
  customer_id: string;
  discount: number;
  points_earned: number;
  createdAt: string;

  sales_staff: {
    id: string;
    username: string;
  };
  customer?: {
    id: string;
    username: string;
  } | null;
}

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_URL}/sales/transactions`);
        console.log("API Response", res.data); // <== Tambahin log ini
        setTransactions(res.data); // ✅ harus array of objects
        console.log("API Response JSON", JSON.stringify(res.data, null, 2));
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    };

    fetchTransactions();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Transaction ID",
      width: 250,
    },
    {
      field: "sales_staff",
      headerName: "Sales Staff",
      width: 150,
      valueGetter: (params: GridValueGetter) =>
        params?.row?.sales_staff?.username ?? "-",
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 150,
      valueGetter: (params) => params?.row?.customer?.username ?? "Guest",
    },
    {
      field: "total_price",
      headerName: "Total Price",
      width: 150,
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 200,
      valueGetter: (params) =>
        params.row?.createdAt
          ? new Date(params.row.createdAt).toLocaleString()
          : "-",
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Transaction List
      </Typography>
      {transactions.length > 0 ? (
        <DataGrid
          rows={transactions}
          getRowId={(row) => row.id}
          columns={columns}
          pageSizeOptions={[10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          onRowClick={(params) => navigate(`/transactions/${params.id}`)}
          disableRowSelectionOnClick
        />
      ) : (
        <Typography>Loading or no transactions found.</Typography>
      )}
    </Box>
  );
};

export default TransactionsPage;
