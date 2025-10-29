import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URL:", process.env.MONGODB_URL);

    const connection = await mongoose.connect(process.env.MONGODB_URL);

    console.log("DB connected Successfully");
    console.log("Connected to database:", connection.connection.name);

    // Add connection event listeners
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });
  } catch (error) {
    console.error("Database connection failed:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    process.exit(1); // Exit the process if database connection fails
  }
};

export default connectToDatabase;
