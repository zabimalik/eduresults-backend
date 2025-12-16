import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true,
  },
  code: {
    type: String,
    required: [true, "Subject code is required"],
    trim: true,
    uppercase: true,
  },
}, {
  timestamps: true,
});

// Create compound index to ensure unique subject name and code
subjectSchema.index({ name: 1 }, { unique: true });
subjectSchema.index({ code: 1 }, { unique: true });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;