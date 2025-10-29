import mongoose from "mongoose";
import Employee from "./models/Employee.js";
import User from "./models/User.js";
import Department from "./models/Department.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testEmployeeData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");

    // Test 1: Check collections exist and count documents
    console.log("\n=== COLLECTION COUNTS ===");
    const employeeCount = await Employee.countDocuments();
    const userCount = await User.countDocuments();
    const departmentCount = await Department.countDocuments();

    console.log(`Employees: ${employeeCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Departments: ${departmentCount}`);

    // Test 2: Check for employees without valid references
    console.log("\n=== CHECKING DATA INTEGRITY ===");

    const employees = await Employee.find().lean();
    console.log(`Found ${employees.length} employees`);

    let employeesWithMissingUsers = 0;
    let employeesWithMissingDepartments = 0;

    for (const employee of employees) {
      // Check if user exists
      const user = await User.findById(employee.userId);
      if (!user) {
        employeesWithMissingUsers++;
        console.log(
          `Employee ${employee.employeeId} has missing user reference: ${employee.userId}`
        );
      }

      // Check if department exists
      const department = await Department.findById(employee.department);
      if (!department) {
        employeesWithMissingDepartments++;
        console.log(
          `Employee ${employee.employeeId} has missing department reference: ${employee.department}`
        );
      }
    }

    console.log(
      `Employees with missing user references: ${employeesWithMissingUsers}`
    );
    console.log(
      `Employees with missing department references: ${employeesWithMissingDepartments}`
    );

    // Test 3: Try the actual query that's failing
    console.log("\n=== TESTING ACTUAL QUERY ===");
    try {
      const employeesWithPopulation = await Employee.find()
        .populate("userId", { password: 0 })
        .populate("department")
        .lean();

      console.log(
        `Successfully fetched ${employeesWithPopulation.length} employees with population`
      );

      // Check the first employee structure
      if (employeesWithPopulation.length > 0) {
        console.log("Sample employee structure:");
        console.log(JSON.stringify(employeesWithPopulation[0], null, 2));
      }
    } catch (populationError) {
      console.error("Population query failed:", populationError.message);

      // Try without population
      console.log("Trying without population...");
      const employeesBasic = await Employee.find().lean();
      console.log(
        `Fetched ${employeesBasic.length} employees without population`
      );

      if (employeesBasic.length > 0) {
        console.log("Sample basic employee structure:");
        console.log(JSON.stringify(employeesBasic[0], null, 2));
      }
    }

    // Test 4: Check departments
    console.log("\n=== CHECKING DEPARTMENTS ===");
    const departments = await Department.find().lean();
    console.log(`Found ${departments.length} departments:`);
    departments.forEach((dept) => {
      console.log(`- ${dept.dep_name} (ID: ${dept._id})`);
    });
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the test
testEmployeeData();
