import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const login1 = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ success: false, error: "Wrong Password" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Admin user already exists" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
    });

    await newUser.save();

    console.log("Admin user created successfully");
    return res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Wrong Password" });
    }

    // Create JWT
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );
    //  set cookie
    res.cookie("role", user.role, {
      maxAge: 900000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("email", user.email, {
      maxAge: 900000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("name", user.name, {
      maxAge: 900000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("token", token, {
      maxAge: 900000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("login catch", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const verify = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

export { login, verify,createAdmin };
