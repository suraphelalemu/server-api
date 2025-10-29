import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import {
  addEmployee,
  upload,
  getEmployees,
  getEmployee,
  updateEmployee,
  fetchEmployeesByDepId,
  getEmployeeByUserId,
  getAllEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", authMiddleware, getEmployees);
router.post("/add", authMiddleware, upload.single("image"), addEmployee);
router.get("/users", authMiddleware, getAllEmployee);

router.get("/:id", authMiddleware, getEmployee);
router.get("/user/:userId", authMiddleware, getEmployeeByUserId);
router.put("/:id", updateEmployee);
router.get("/department/:id", authMiddleware, fetchEmployeesByDepId);

export default router;


