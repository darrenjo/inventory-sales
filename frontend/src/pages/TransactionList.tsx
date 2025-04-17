import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Divider } from "@mui/material";

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
    username?: string;
    name?: string;
  } | null;
}

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_URL}/sales/transactions`);

        // First log the raw data to see its structure
        console.log("Raw API Response:", res.data);

        const mapped = res.data.map((t: Transaction) => {
          console.log(
            "Processing transaction:",
            t.id,
            "Customer data:",
            t.customer
          );

          return {
            ...t,
            salesStaffName: t.sales_staff?.username || "-",
            // More thorough check of customer data structure
            customerName: t.customer
              ? t.customer.username || t.customer.name || `ID: ${t.customer_id}`
              : "Guest",
            formattedDate: new Date(t.createdAt).toLocaleString(),
            rawDate: new Date(t.createdAt),
          };
        });

        setTransactions(mapped);
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
      field: "salesStaffName",
      headerName: "Sales Staff",
      width: 150,
      // valueGetter: (params: GridValueGetterParams) =>
      //   params?.row?.sales_staff?.username ?? "-",
    },
    {
      field: "customerName",
      headerName: "Customer",
      width: 150,
      // valueGetter: (params: GridValueGetterParams) =>
      //   params?.row?.customer?.username ?? "Guest",
    },
    {
      field: "total_price",
      headerName: "Total Price",
      width: 150,
    },
    {
      field: "rawDate",
      headerName: "Date",
      width: 200,
      type: "dateTime", // ⬅️ ini penting banget buat sorting bener!
      // valueFormatter: (params) => params.row.formattedDate,
      // valueGetter: (params: GridValueGetterParams) =>
      //   params.row?.createdAt
      //     ? new Date(params.row.createdAt).toLocaleString()
      //     : "-",
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Transaction List
      </Typography>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />
      
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

// import React, { useEffect, useState } from "react";
// import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Box, Typography } from "@mui/material";

// const API_URL = import.meta.env.VITE_API_URL;

// interface Transaction {
//   id: string;
//   sales_staff_id: string;
//   total_price: number;
//   customer_id: string;
//   discount: number;
//   points_earned: number;
//   createdAt: string;

//   sales_staff: {
//     id: string;
//     username: string;
//   };
//   customer?: {
//     id: string;
//     username: string;
//   } | null;
// }

// const TransactionsPage: React.FC = () => {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/sales/transactions`);
//         console.log("API Response", res.data);
//         setTransactions(res.data);
//         console.log("API Response JSON", JSON.stringify(res.data, null, 2));
//       } catch (err) {
//         console.error("Failed to fetch transactions", err);
//       }
//     };

//     fetchTransactions();
//   }, []);

//   const columns: GridColDef[] = [
//     {
//       field: "id",
//       headerName: "Transaction ID",
//       width: 250,
//     },
//     {
//       field: "sales_staff",
//       headerName: "Sales Staff",
//       width: 150,
//       valueGetter: (params: GridRowParams) => {
//         if (params ) {
//           return params.row.sales_staff.username;
//         }
//         return "-"; // Default value if sales_staff is not available
//       },
//     },
//     {
//       field: "customer",
//       headerName: "Customer",
//       width: 150,
//       valueGetter: (params: GridRowParams) => {
//         if (params && params.row && params.row.customer) {
//           return params.row.customer.username;
//         }
//         return "Guest"; // Default value if customer is not available
//       },
//     },
//     {
//       field: "total_price",
//       headerName: "Total Price",
//       width: 150,
//     },
//     {
//       field: "createdAt",
//       headerName: "Date",
//       width: 200,
//       valueGetter: (params: GridRowParams) => {
//         if (params && params.row && params.row.createdAt) {
//           return new Date(params.row.createdAt).toLocaleString();
//         }
//         return "-"; // Default value if createdAt is not available
//       },
//     },
//   ];

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         Transaction List
//       </Typography>
//       {transactions.length > 0 ? (
//         <DataGrid
//           rows={transactions}
//           columns={columns}
//           pageSizeOptions={[10]}
//           initialState={{
//             pagination: { paginationModel: { pageSize: 10, page: 0 } },
//           }}
//           onRowClick={(params) => navigate(`/transactions/${params.id}`)}
//           disableRowSelectionOnClick
//         />
//       ) : (
//         <Typography>No transactions found.</Typography>
//       )}
//     </Box>
//   );
// };

// export default TransactionsPage;
