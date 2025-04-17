import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Close as CloseIcon } from "@mui/icons-material";  // X icon from Material UI

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

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
        padding: "20px",
      }}
    >
      {/* Animated X Icon */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
        }}
        style={{
          marginBottom: "20px",
        }}
      >
        <CloseIcon
          sx={{
            fontSize: 60,
            color: "#FF6347",
            textShadow: "0 0 15px #FF6347",
          }}
        />
      </motion.div>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#FF6347",
            textShadow: "0 0 15px #FF6347",
            marginBottom: "20px",
          }}
        >
          Unauthorized Access
        </Typography>
      </motion.div>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 300,
          opacity: 0.7,
          marginBottom: "20px",
        }}
      >
        Sorry, you do not have permission to view this page.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{
          padding: "12px 24px",
          fontWeight: "bold",
          // backgroundColor: "#64B5F6",
          "&:hover": {
            backgroundColor: "#4D90E2",
          },
        }}
        onClick={handleGoBack}
      >
        Back to Previous Page
      </Button>
    </Box>
  );
};

export default Unauthorized;
