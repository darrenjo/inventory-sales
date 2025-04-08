import {
  Container,
  Paper,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";

type Product = {
  id: string;
  name: string;
  category: string;
  color_code: string;
};

type Batch = {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
  createdAt: string;
};

const ProductDetail = () => {
  const location = useLocation();
  const product = location.state?.product as Product | undefined;

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!product) return;

      try {
        const res = await api.get(`/products/${product.id}/batches`);
        setBatches(res.data);
      } catch (err) {
        console.error("Error fetching batch list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [product]);

  if (loading)
    return <CircularProgress sx={{ mt: 4, mx: "auto", display: "block" }} />;
  if (!product) return <Typography>Product not found.</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h5" fontWeight="bold">
          📦 {product.name}
        </Typography>
        <Typography variant="subtitle1">
          Category: {product.category}
        </Typography>
        <Typography variant="subtitle1">
          Color Code: {product.color_code}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          📦 Batch List
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date In</TableCell>
              <TableCell>Purchase Price</TableCell>
              <TableCell>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.id}</TableCell>
                <TableCell>{batch.createdAt.slice(0, 10)}</TableCell>
                <TableCell>{batch.price}</TableCell>
                <TableCell>{batch.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ProductDetail;
