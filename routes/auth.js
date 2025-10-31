import express from "express";
import { login, verify,createAdmin } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddlware.js";
import { logout } from "../controllers/Logout.js";

const router = express.Router();

router.post("/login", login);
router.get("/verify", authMiddleware, verify);
router.post("/logout", logout);
router.post("/create-admin",createAdmin);
export default router;








