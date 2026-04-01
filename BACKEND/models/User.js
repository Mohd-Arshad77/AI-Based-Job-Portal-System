import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const parsedDataSchema = new mongoose.Schema(
  {
    skills: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    experience: { type: [String], default: [] },
    summary: { type: String, default: "" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role: { type: String, enum: ["user", "recruiter"], default: "user" },
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    education: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    parsedData: { type: parsedDataSchema, default: () => ({}) },
    refreshToken: { type: String, default: null, select: false }
  },
  { timestamps: true }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
