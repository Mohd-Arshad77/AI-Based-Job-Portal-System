import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = process.env.ADMIN_EMAIL 
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME 

    await User.deleteOne({ email: adminEmail });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.collection.insertOne({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(" Admin created successfully with clean data!");
    process.exit();
  } catch (error) {
    console.error(" Error seeding admin: ", error);
    process.exit(1);
  }
};

seedAdmin();
