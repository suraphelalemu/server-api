import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

const addSalary = async (req, res) => {
  try {
    const { employeeId, basicSalary, allowances, deductions, payDate } =
      req.body;

    const totalSalary =
      parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions);

    const newSalary = new Salary({
      employeeId,
      basicSalary,
      allowances,
      deductions,
      netSalary: totalSalary,
      payDate,
    });

    await newSalary.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "salary add server error" });
  }
};

const getSalary = async (req, res) => {
  try {
    const { id, role } = req.params;
    console.log("getSalary called with id:", id, "role:", role);

    let salary;
    if (role === "admin") {
      console.log("Admin role, fetching salaries for employee _id:", id);
      salary = await Salary.find({ employeeId: id }).populate(
        "employeeId",
        "employeeId"
      );
      console.log("Salaries found:", salary.length);
    } else {
      console.log("Employee role, finding employee by userId:", id);
      const employee = await Employee.findOne({ userId: id });
      if (!employee) {
        console.log("Employee not found for userId:", id);
        return res
          .status(404)
          .json({ success: false, error: "Employee not found" });
      }
      console.log("Employee found:", employee._id);
      salary = await Salary.find({ employeeId: employee._id }).populate(
        "employeeId",
        "employeeId"
      );
      console.log("Salaries found:", salary.length);
    }
    return res.status(200).json({ success: true, salary });
  } catch (error) {
    console.error("Error in getSalary:", error);
    return res
      .status(500)
      .json({ success: false, error: "salary get server error" });
  }
};

export { addSalary, getSalary };

