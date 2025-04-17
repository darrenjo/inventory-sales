import express from "express";
import {
  getUsers,
  profile,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";

const router = express.Router();
router.get(
  "/",
  authenticateToken,
  authorizePermission("manage_users"),
  getUsers
);
// router.get(
//   "/profile",
//   authenticateToken,
//   authorizePermission("manage_users"),
//   profile
// );
router.post(
  "/",
  authenticateToken,
  authorizePermission("manage_users"),
  createUser
);
router.patch(
  "/:id",
  authenticateToken,
  authorizePermission("manage_users"),
  updateUser
);
router.delete(
  "/:id",
  authenticateToken,
  authorizePermission("manage_users"),
  deleteUser
);

router.get("/profile", authenticateToken, profile);

export default router;
