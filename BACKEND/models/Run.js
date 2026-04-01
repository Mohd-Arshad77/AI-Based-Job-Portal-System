import mongoose from "mongoose";

const runSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeText: { type: String, required: true },
    extractedSkills: { type: [String], default: [] },
    recommendedJobs: [
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        matchedSkills: { type: [String], default: [] },
        score: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Run", runSchema);
