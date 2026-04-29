/**
 * One-time migration: consolidate `resume` → `resumeUrl`
 *
 * Run once with:  node scripts/migrateResumeField.js
 *
 * What it does:
 *  1. For every user that has `resume` but no `resumeUrl`, copies the value.
 *  2. Unsets the `resume` field from every user document.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

const db = mongoose.connection.db;
const users = db.collection("users");

// Step 1 – Backfill: resume → resumeUrl for users missing resumeUrl
const backfill = await users.updateMany(
  { resume: { $exists: true, $ne: "" }, $or: [{ resumeUrl: { $exists: false } }, { resumeUrl: "" }] },
  [{ $set: { resumeUrl: "$resume" } }]
);
console.log(`↗  Backfilled resumeUrl for ${backfill.modifiedCount} user(s)`);

// Step 2 – Unset the old `resume` field from all documents
const unset = await users.updateMany(
  { resume: { $exists: true } },
  { $unset: { resume: "" } }
);
console.log(`🗑  Removed the 'resume' field from ${unset.modifiedCount} document(s)`);

await mongoose.disconnect();
console.log("✅ Migration complete. Disconnected.");
