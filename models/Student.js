import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollId: {
    type: String,
    required: [true, "Roll ID is required"],
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, "Student name is required"],
    trim: true,
  },
  fatherName: {
    type: String,
    required: [true, "Father name is required"],
    trim: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Class ID is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  academicYear: {
    type: String,
    required: [true, "Academic year is required"],
    default: function() {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create indexes for better performance
studentSchema.index({ rollId: 1 }, { unique: true });
studentSchema.index({ classId: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ name: 1 });

// Virtual populate for class details
studentSchema.virtual('class', {
  ref: 'Class',
  localField: 'classId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate academic year if not provided
studentSchema.pre('save', function() {
  if (!this.academicYear) {
    const currentYear = new Date().getFullYear();
    this.academicYear = `${currentYear}-${currentYear + 1}`;
  }
});

const Student = mongoose.model("Student", studentSchema);

export default Student;