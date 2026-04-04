import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: [true, "Interview date and time is required."] },
    mode: {
      type: String,
      enum: ["Video Call", "Phone", "Onsite"],
      default: "Video Call"
    },
    meetingLink: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
