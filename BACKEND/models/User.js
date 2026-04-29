import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const parsedDataSchema = new mongoose.Schema(
  {
    skills: [String],
    projects: [String],
    experience: [String],
    summary: String
  },
  { _id: false }
);

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
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
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
    isBlocked: {
      type: Boolean,
      default: false
    },
    verificationCode: String,
    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: Number,
      default: 0
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

userSchema.pre("save", function (next) {
  if (this.role === "recruiter" || this.role === "admin") {
    this.skills = undefined;
    this.experience = undefined;
    this.education = undefined;
    this.resumeUrl = undefined;
    this.resumeUpdatedAt = undefined;
    this.parsedData = undefined;
  }
  next();
});


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