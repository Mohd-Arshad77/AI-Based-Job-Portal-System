import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// 🔹 Parsed Resume Data
const parsedDataSchema = new mongoose.Schema(
  {
    skills: [String],
    projects: [String],
    experience: [String],
    summary: String
  },
  { _id: false }
);

// 🔹 Main User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,          // ✅ prevent duplicates
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false          // ✅ hide by default
    },

    role: {
      type: String,
      enum: ["user", "recruiter", "admin"],
      default: "user"
    },

    company: String,

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    location: {
      type: String,
      trim: true,
      default: ""
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verificationCode: String,

    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: String,
      default: ""
    },
    education: {
      type: String,
      default: ""
    },
    resumeUrl: {
      type: String,
      default: ""
    },
    resumeUpdatedAt: {
      type: Date,
      default: null
    },

    parsedData: parsedDataSchema,

    refreshToken: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true
  }
);


// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});



userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

userSchema.statics.comparePassword = async function (enteredPassword, hashedPassword) {
  return bcrypt.compare(enteredPassword, hashedPassword);
};


export default mongoose.model("User", userSchema);
