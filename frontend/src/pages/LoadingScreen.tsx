import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";

const LoadingScreen = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        bgcolor: "#0A1929",
        color: "white",
      }}
    >
      {/* Glowing Circle */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
        }}
        style={{
          marginBottom: "20px",
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: "#64B5F6",
            filter: "drop-shadow(0 0 10px #64B5F6)",
          }}
        />
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          delay: 0.2,
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: "bold", letterSpacing: 1 }}
        >
          Fetching data, please wait...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;
