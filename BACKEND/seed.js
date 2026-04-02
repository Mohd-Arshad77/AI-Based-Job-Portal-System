import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedRecruiter = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.findOneAndDelete({ email: "recruiter@test.com" });

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.collection.insertOne({
      name: "Recruiter",
      email: "recruiter@test.com",
      password: hashedPassword,
      role: "recruiter",
      skills: [],
      experience: "",
      education: "",
      resumeUrl: "",
      parsedData: {
        skills: [],
        projects: [],
        experience: [],
        summary: ""
      },
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Recruiter created successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedRecruiter();
