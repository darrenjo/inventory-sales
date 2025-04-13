// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import debounce from "lodash.debounce";
// import {
//   TextField,
//   Button,
//   Pagination,
//   Container,
//   Typography,
//   Box,
//   Paper,
// } from "@mui/material";
// import SideNavbar from "../components/SideNavBar";
// import InventoryTable from "../components/InventoryTable";

// const API_URL = import.meta.env.VITE_API_URL;

// interface Batch {
//   id: string;
//   product_id: string;
//   price: number;
//   quantity: number;
// }

// interface InventoryItem {
//   id: string;
//   name: string;
//   category: string;
//   color_code: string;
//   Batches: Batch[];
// }

// function HomePage() {
//   const [inventory, setInventory] = useState<InventoryItem[]>([]);
//   const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
//     []
//   );
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [debouncedSearch, setDebouncedSearch] = useState<string>("");
//   const [page, setPage] = useState<number>(1);
//   const [itemsPerPage] = useState<number>(10);
//   const navigate = useNavigate();

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//     debounceSearch(e.target.value);
//   };

//   const debounceSearch = useCallback(
//     debounce((query: string) => {
//       setDebouncedSearch(query);
//       setPage(1);
//     }, 500),
//     []
//   );

//   useEffect(() => {
//     const fetchInventory = async () => {
//       try {
//         const response = await axios.get<InventoryItem[]>(
//           `${API_URL}/products`
//         );

//         // Process the inventory and calculate total quantity
//         const processedData = response.data.map((item) => ({
//           ...item,
//           quantity:
//             item.Batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0, // Ensure safe handling
//         }));

//         setInventory(processedData);
//       } catch (error) {
//         console.error("Error fetching inventory:", error);
//       }
//     };

//     fetchInventory();
//   }, []);

//   // Filter and paginate data based on debounced search term
//   useEffect(() => {
//     const filtered = inventory.filter(
//       (item) =>
//         item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//         item.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//         item.color_code.toLowerCase().includes(debouncedSearch.toLowerCase())
//     );

//     setFilteredInventory(filtered);
//   }, [debouncedSearch, inventory]);

//   // Paginate filtered inventory
//   const currentPageInventory = filteredInventory.slice(
//     (page - 1) * itemsPerPage,
//     page * itemsPerPage
//   );

//   const handleChangePage = (
//     _event: React.ChangeEvent<unknown>,
//     value: number
//   ) => {
//     setPage(value); // Update page state on pagination change
//   };

//   return (
//     <Box display="flex">
//       <SideNavbar />
//       <Container maxWidth="lg" sx={{ mt: 4, color: "white" }}>
//         <Paper sx={{ p: 3, backgroundColor: "#0A1929" }}>
//           <Typography variant="h4" sx={{ mb: 2, color: "white" }}>
//             Sales
//           </Typography>

//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search inventory"
//             value={searchTerm}
//             onChange={handleSearchChange}
//             sx={{ mb: 3, backgroundColor: "white", borderRadius: 1 }}
//           />

//           <InventoryTable inventory={currentPageInventory} />

//           <Pagination
//             count={Math.ceil(filteredInventory.length / itemsPerPage)} // Calculate the total number of pages
//             page={page}
//             onChange={handleChangePage}
//             color="primary"
//             sx={{ mt: 3, display: "flex", justifyContent: "center" }}
//           />

//           <Button
//             variant="contained"
//             color="primary"
//             sx={{ mt: 4, display: "block", mx: "auto" }}
//             onClick={() => navigate("/add-inventory")}
//           >
//             Add Sales
//           </Button>
//         </Paper>
//       </Container>
//     </Box>
//   );
// }

// export default HomePage;
