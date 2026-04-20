import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Interview", "Rejected", "Hired"],
      default: "Pending"
    },
    appliedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ user: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, appliedAt: -1 });
applicationSchema.index({ recruiter: 1, appliedAt: -1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

export default mongoose.model("Application", applicationSchema);

