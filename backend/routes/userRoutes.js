import express from "express";
import { getUsers } from "../controllers/userController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();
router.get("/", authenticateToken, authorizeRole(["superadmin"]), getUsers);

export default router;
