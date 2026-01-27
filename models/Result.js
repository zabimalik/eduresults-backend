import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: [true, "Student ID is required"],
  },
  rollId: {
    type: String,
    required: [true, "Roll ID is required"],
    trim: true,
    uppercase: true,
  },
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
    trim: true,
    uppercase: true,
    index: true,
  },
  marks: {
    type: Number,
    required: [true, "Marks are required"],
    min: [0, "Marks cannot be negative"],
  },
  maxMarks: {
    type: Number,
    required: [true, "Maximum marks are required"],
    min: [1, "Maximum marks must be at least 1"],
  },
  examType: {
    type: String,
    required: [true, "Exam type is required"],
    enum: ["Final Term", "Mid Term", "Monthly Test"],
    default: "Final Term",
  },
  percentage: {
    type: Number,
    default: function () {
      return (this.marks / this.maxMarks) * 100;
    }
  },
  grade: {
    type: String,
    default: function () {
      const percentage = (this.marks / this.maxMarks) * 100;
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C';
      if (percentage >= 40) return 'D';
      return 'F';
    }
  },
  academicYear: {
    type: String,
    required: [true, "Academic year is required"],
    default: function () {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
  },
}, {
  timestamps: true,
});

// Create compound indexes for better performance and uniqueness
resultSchema.index({
  studentId: 1,
  subjectId: 1,
  examType: 1,
  academicYear: 1
}, { unique: true });

resultSchema.index({ classId: 1 });
resultSchema.index({ rollId: 1 });
resultSchema.index({ academicYear: 1 });

// Virtual populate for related data
resultSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

resultSchema.virtual('class', {
  ref: 'Class',
  localField: 'classId',
  foreignField: '_id',
  justOne: true
});

resultSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subjectId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
resultSchema.set('toJSON', { virtuals: true });
resultSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate percentage and grade
resultSchema.pre('save', function () {
  if (this.marks !== undefined && this.maxMarks !== undefined) {
    this.percentage = Math.round((this.marks / this.maxMarks) * 100 * 100) / 100;

    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B+';
    else if (this.percentage >= 60) this.grade = 'B';
    else if (this.percentage >= 50) this.grade = 'C';
    else if (this.percentage >= 40) this.grade = 'D';
    else this.grade = 'F';
  }

  if (!this.academicYear) {
    const currentYear = new Date().getFullYear();
    this.academicYear = `${currentYear}-${currentYear + 1}`;
  }
});

const Result = mongoose.model("Result", resultSchema);

export default Result;