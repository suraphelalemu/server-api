// import express from "express";
// import cors from "cors";
// import authRouter from "./routes/auth.js";
// import departmentRouter from "./routes/department.js";
// import employeeRouter from "./routes/employee.js";
// import salaryRouter from "./routes/salary.js";
// import leaveRouter from "./routes/leave.js";
// import settingRouter from "./routes/setting.js";
// import attendanceRouter from "./routes/attendance.js";
// import dashboardRouter from "./routes/dashboard.js";
// import connectToDatabase from "./db/db.js";

// connectToDatabase();
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.static("public/uploads"));
// app.use("/api/auth", authRouter);
// app.use("/api/department", departmentRouter);
// app.use("/api/employee", employeeRouter);
// app.use("/api/salary", salaryRouter);
// app.use("/api/leave", leaveRouter);
// app.use("/api/setting", settingRouter);
// app.use("/api/attendance", attendanceRouter);
// app.use("/api/dashboard", dashboardRouter);

// app.listen(process.env.PORT, () => {
//   console.log(`Server is Running on port ${process.env.URL}`);
// });
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import salaryRouter from "./routes/salary.js";
import leaveRouter from "./routes/leave.js";
import settingRouter from "./routes/setting.js";
import attendanceRouter from "./routes/attendance.js";
import dashboardRouter from "./routes/dashboard.js";
import connectToDatabase from "./db/db.js";

import "dotenv/config"; //import the dotenv file
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Serve static files under /uploads
app.use("/uploads", express.static("public/uploads"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/setting", settingRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/dashboard", dashboardRouter);
connectToDatabase();

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(
    `Server is Running on ${process.env.URL || "http://localhost:" + PORT}`
  );
});














