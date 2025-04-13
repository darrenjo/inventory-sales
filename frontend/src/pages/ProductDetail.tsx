import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Batch {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  color_code: string;
  Batches: Batch[];
  // Add any other fields that might be in your product data
}

const ProductDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state as { product: Product };

  // Calculate total quantity and total value
  const totalQuantity = product.Batches.reduce(
    (sum, batch) => sum + batch.quantity,
    0
  );

  const totalValue = product.Batches.reduce(
    (sum, batch) => sum + batch.price * batch.quantity,
    0
  );

  // Function to format currency as IDR
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Function to go back to inventory list
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box display="flex">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Back to Inventory
        </Button>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: "#0A1929",
            color: "white",
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              {product.name}
            </Typography>
            <Chip
              label={product.category}
              color="primary"
              sx={{ fontSize: "1rem", backgroundColor: "#1976d2" }}
            />
          </Box>

          <Divider sx={{ mb: 3, backgroundColor: "#334155" }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              mb: 4,
            }}
          >
            <Paper sx={{ p: 3, backgroundColor: "#112D4E", flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: 2,
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  ID:
                </Typography>
                <Typography variant="body1">{product.id}</Typography>

                <Typography variant="body1" fontWeight="medium">
                  Name:
                </Typography>
                <Typography variant="body1">{product.name}</Typography>

                <Typography variant="body1" fontWeight="medium">
                  Category:
                </Typography>
                <Typography variant="body1">{product.category}</Typography>
                <Typography variant="body1" fontWeight="medium">
                  Color:
                </Typography>
                <Typography variant="body1">{product.color_code}</Typography>

                <Typography variant="body1" fontWeight="medium">
                  Color Code:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: product.color_code,
                      border: "1px solid white",
                    }}
                  />
                  <Typography variant="body1">{product.color_code}</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, backgroundColor: "#112D4E", flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Inventory Summary
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: 2,
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Total Batches:
                </Typography>
                <Typography variant="body1">
                  {product.Batches.length}
                </Typography>

                <Typography variant="body1" fontWeight="medium">
                  Total Quantity:
                </Typography>
                <Typography variant="body1">{totalQuantity} units</Typography>

                <Typography variant="body1" fontWeight="medium">
                  Total Value:
                </Typography>
                <Typography variant="body1">{formatIDR(totalValue)}</Typography>
              </Box>
            </Paper>
          </Box>

          <Typography variant="h5" gutterBottom>
            Batch Details
          </Typography>

          <TableContainer component={Paper} sx={{ backgroundColor: "#112D4E" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#001E3C" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Batch ID
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Product ID
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Price
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Quantity
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Total Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {product.Batches.map((batch) => (
                  <TableRow
                    key={batch.id}
                    hover
                    sx={{ "&:hover": { backgroundColor: "#103559" } }}
                  >
                    <TableCell sx={{ color: "white" }}>{batch.id}</TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {batch.product_id}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>
                      {formatIDR(batch.price)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>
                      {batch.quantity}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>
                      {formatIDR(batch.price * batch.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductDetail;
