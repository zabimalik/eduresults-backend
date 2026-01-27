import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("FATAL ERROR: MONGO_URI is not defined in environment variables");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
