import multer from "multer";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({ storage: storage });

const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !employeeId ||
      !department ||
      !salary ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be provided.",
      });
    }

    // Validate department exists
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid department ID." });
    }

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res
        .status(400)
        .json({ success: false, error: "Department does not exist." });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "User already registered." });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      profileImage: req.file ? req.file.filename : "",
    });
    const savedUser = await newUser.save();

    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
    });

    await newEmployee.save();

    return res
      .status(200)
      .json({ success: true, message: "Employee created." });
  } catch (error) {
    console.error("Error in adding employee:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error in adding employee." });
  }
};

const getEmployees = async (req, res) => {
  try {
    console.log("Attempting to fetch employees...");

    // First, check if there are any employees at all
    const employeeCount = await Employee.countDocuments();
    console.log(`Total employees in database: ${employeeCount}`);

    if (employeeCount === 0) {
      return res.status(200).json({
        success: true,
        employees: [],
        message: "No employees found in database",
      });
    }

    // Try to fetch employees with population
    const employees = await Employee.find()
      .populate("userId", { password: 0 })
      .populate("department")
      .lean(); // Use lean() for better performancecls

    console.log(`Successfully fetched ${employees.length} employees`);

    // Check for employees with missing department references
    const employeesWithMissingDept = employees.filter((emp) => !emp.department);
    if (employeesWithMissingDept.length > 0) {
      console.warn(
        `Warning: ${employeesWithMissingDept.length} employees have missing department references`
      );
    }

    // Check for employees with missing user references
    const employeesWithMissingUser = employees.filter((emp) => !emp.userId);
    if (employeesWithMissingUser.length > 0) {
      console.warn(
        `Warning: ${employeesWithMissingUser.length} employees have missing user references`
      );
    }

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Detailed error fetching employees:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Try to fetch employees without population as fallback
    try {
      console.log(
        "Attempting fallback: fetching employees without population..."
      );
      const employeesBasic = await Employee.find().lean();
      console.log(
        `Fallback successful: fetched ${employeesBasic.length} employees without population`
      );

      return res.status(200).json({
        success: true,
        employees: employeesBasic,
        warning:
          "Fetched employees without user/department details due to population error",
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return res.status(500).json({
        success: false,
        error: "Get employees server error.",
        details: error.message,
      });
    }
  }
};

const getAllEmployee = async (req, res) => {
  console.log("the users come here");
  let employee = await Employee.find();
  res.send(employee);
};

const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Attempting to fetch employee with ID: ${id}`);

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid employee ID format.",
      });
    }

    let employee = await Employee.findById(id)
      .populate("userId", { password: 0 })
      .populate("department")
      .lean();

    if (!employee) {
      console.log(`Employee with ID ${id} not found`);
      return res
        .status(404)
        .json({ success: false, error: "Employee not found." });
    }

    console.log(`Successfully fetched employee: ${employee.employeeId}`);
    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Detailed error fetching employee:", {
      employeeId: id,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Try fallback without population
    try {
      console.log(
        "Attempting fallback: fetching employee without population..."
      );
      const employeeBasic = await Employee.findById(id).lean();

      if (!employeeBasic) {
        return res.status(404).json({
          success: false,
          error: "Employee not found.",
        });
      }

      return res.status(200).json({
        success: true,
        employee: employeeBasic,
        warning:
          "Fetched employee without user/department details due to population error",
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return res.status(500).json({
        success: false,
        error: "Get employee server error.",
        details: error.message,
      });
    }
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, maritalStatus, designation, department, salary } = req.body;

    console.log("Update request body:", req.body);
    console.log("Employee ID:", id);

    const employee = await Employee.findById(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found." });
    }

    const user = await User.findById(employee.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    // Update user name if provided
    if (name) {
      await User.findByIdAndUpdate(employee.userId, { name });
    }

    // Update employee fields
    const updateData = {};
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
    if (designation !== undefined) updateData.designation = designation;
    if (salary !== undefined) updateData.salary = salary;
    if (department !== undefined) updateData.department = department;

    console.log("Updating employee with data:", updateData);

    await Employee.findByIdAndUpdate(id, updateData);

    return res
      .status(200)
      .json({ success: true, message: "Employee updated." });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res
      .status(500)
      .json({ success: false, error: "Update employees server error." });
  }
};

const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Attempting to fetch employees for department ID: ${id}`);

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid department ID format.",
      });
    }

    const employees = await Employee.find({ department: id })
      .populate("userId", { password: 0 })
      .lean();

    console.log(`Found ${employees.length} employees for department ${id}`);
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Detailed error fetching employees by department ID:", {
      departmentId: id,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Try fallback without population
    try {
      console.log(
        "Attempting fallback: fetching employees without population..."
      );
      const employeesBasic = await Employee.find({ department: id }).lean();

      return res.status(200).json({
        success: true,
        employees: employeesBasic,
        warning:
          "Fetched employees without user details due to population error",
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return res.status(500).json({
        success: false,
        error: "Get employees by department ID server error.",
        details: error.message,
      });
    }
  }
};

const getEmployeeByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    console.log(`Attempting to fetch employee with User ID: ${userId}`);

    // Validate ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format.",
      });
    }

    let employee = await Employee.findOne({ userId: userId })
      .populate("userId", { password: 0 })
      .populate("department")
      .lean();

    if (!employee) {
      console.log(`Employee with User ID ${userId} not found`);
      return res
        .status(404)
        .json({ success: false, error: "Employee not found." });
    }

    console.log(`Successfully fetched employee: ${employee.employeeId}`);
    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Detailed error fetching employee by user ID:", {
      userId: userId,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Try fallback without population
    try {
      console.log(
        "Attempting fallback: fetching employee without population..."
      );
      const employeeBasic = await Employee.findOne({ userId: userId }).lean();

      if (!employeeBasic) {
        return res.status(404).json({
          success: false,
          error: "Employee not found.",
        });
      }

      return res.status(200).json({
        success: true,
        employee: employeeBasic,
        warning:
          "Fetched employee without user/department details due to population error",
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return res.status(500).json({
        success: false,
        error: "Get employee by user ID server error.",
        details: error.message,
      });
    }
  }
};

export {
  addEmployee,
  upload,
  getEmployees,
  getEmployee,
  updateEmployee,
  fetchEmployeesByDepId,
  getEmployeeByUserId,
  getAllEmployee,
};
