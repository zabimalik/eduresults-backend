import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Class name is required"],
    trim: true,
  },
  section: {
    type: String,
    required: [true, "Section is required"],
    trim: true,
  },
}, {
  timestamps: true,
});

// Create compound index to ensure unique class-section combination
classSchema.index({ name: 1, section: 1 }, { unique: true });

const Class = mongoose.model("Class", classSchema);

export default Class;