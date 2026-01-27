import mongoose from "mongoose";

const combinationSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Class ID is required"],
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: [true, "Subject ID is required"],
  },
  subjectCode: {
    type: String,
    required: [true, "Subject code is required"],
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create compound index to ensure unique class-subject combination
combinationSchema.index({ classId: 1, subjectId: 1 }, { unique: true });

// Virtual populate for class and subject details
combinationSchema.virtual('class', {
  ref: 'Class',
  localField: 'classId',
  foreignField: '_id',
  justOne: true
});

combinationSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subjectId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
combinationSchema.set('toJSON', { virtuals: true });
combinationSchema.set('toObject', { virtuals: true });

const Combination = mongoose.model("Combination", combinationSchema);

export default Combination;