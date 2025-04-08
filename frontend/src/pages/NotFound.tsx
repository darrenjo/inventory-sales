import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      bgcolor="#f9f9f9"
      px={2}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* SVG Ilustrasi */}
        <img
          src="https://undraw.co/api/illustrations/91cfdd93-e14e-4e7b-bd4e-b9e844e0cb43"
          alt="Not Found Illustration"
          width={300}
          style={{ marginBottom: "2rem" }}
        />
      </motion.div>

      <Typography variant="h3" fontWeight="bold" color="primary">
        404
      </Typography>
      <Typography variant="h6" mt={1} mb={3} color="text.secondary">
        Halaman tidak ditemukan atau sudah dipindahkan.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.05 }}
        component={motion.button}
      >
        Kembali ke Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;
