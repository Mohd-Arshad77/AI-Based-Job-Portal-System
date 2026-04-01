import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Job title is required"], trim: true },
    company: { type: String, required: [true, "Company is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    experienceRequired: { type: String, default: "" },
    skillsRequired: { type: [String], default: [] },
    description: { type: String, required: [true, "Description is required"] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
