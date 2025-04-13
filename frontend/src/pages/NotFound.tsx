import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NotFoundSvg from "/assets/notfound.svg";

const NotFound = () => {
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const waveTransition = {
    scale: {
      type: "spring",
      stiffness: 500,
      damping: 15,
    },
  };

  return (
    <Box
      component={motion.div}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="90vh"
      textAlign="center"
      bgcolor="#f9f9f9"
      px={2}
    >
      {/* SVG ILUSTRASI */}
      <motion.img
        src={NotFoundSvg}
        alt="404 Not Found"
        width={300}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ marginBottom: "2rem" }}
      />

      <Typography variant="h3" fontWeight="bold" color="primary">
        404
      </Typography>
      <Typography variant="h6" mt={1} mb={3} color="text.secondary">
        Halaman tidak ditemukan atau sudah dipindahkan.
      </Typography>

      {/* BUTTON DENGAN EFEK GELONJANG */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={waveTransition}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/")}
          sx={{ px: 4, py: 1.5, fontWeight: "bold", borderRadius: 3 }}
        >
          Kembali ke Dashboard
        </Button>
      </motion.div>
    </Box>
  );
};

export default NotFound;
