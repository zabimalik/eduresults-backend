import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Notice title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  content: {
    type: String,
    required: [true, "Notice content is required"],
    trim: true,
    maxlength: [2000, "Content cannot exceed 2000 characters"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  targetAudience: {
    type: String,
    enum: ["all", "students", "teachers", "parents"],
    default: "all",
  },
  createdBy: {
    type: String,
    default: "Admin",
  },
}, {
  timestamps: true,
});

// Create indexes for better performance
noticeSchema.index({ isActive: 1 });
noticeSchema.index({ createdAt: -1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ targetAudience: 1 });
noticeSchema.index({ expiryDate: 1 });

// Virtual to check if notice is expired
noticeSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual to check if notice is currently active and not expired
noticeSchema.virtual('isCurrentlyActive').get(function() {
  return this.isActive && !this.isExpired;
});

// Ensure virtual fields are serialized
noticeSchema.set('toJSON', { virtuals: true });
noticeSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate expiry date
noticeSchema.pre('save', function() {
  if (this.expiryDate && this.expiryDate <= new Date()) {
    this.isActive = false;
  }
});

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;