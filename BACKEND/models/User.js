import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const parsedDataSchema = new mongoose.Schema(
  {
    skills: { type: [String] },
    projects: { type: [String] },
    experience: { type: [String] },
    summary: { type: String }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role: { type: String, enum: ["user", "recruiter", "admin"], default: "user" },
    
   
    company: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },

   
    skills: { type: [String] },
    experience: { type: String },
    education: { type: String },
    resumeUrl: { type: String },
    parsedData: { type: parsedDataSchema },
    
    refreshToken: { type: String, default: null, select: false }
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ email: 1, role: 1, verificationCode: 1 });
userSchema.index({ refreshToken: 1 }, { partialFilterExpression: { refreshToken: { $type: "string" } } });

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

userSchema.statics.comparePassword = async function (enteredPassword, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compare(enteredPassword, hashedPassword);
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    console.log("Password field missing in user document");
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
