import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // Ganti sesuai home route
    }, 2000); // 2 detik

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        height: "100vh",
        bgcolor: "#0A1929",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        color: "white",
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
        }}
      >
        {/* Ganti ini dengan logo app atau animasi SVG kalau ada */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#64B5F6",
            textShadow: "0 0 10px #64B5F6",
          }}
        >
          Fetching Data...
        </Typography>
      </motion.div>

      <Typography
        variant="subtitle1"
        sx={{ mt: 2, fontWeight: 300, opacity: 0.7 }}
      >
        Your inventory, simplified.
      </Typography>
    </Box>
  );
};

export default SplashScreen;
