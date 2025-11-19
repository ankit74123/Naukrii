import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an alert name'],
      trim: true,
    },
    keywords: {
      type: String,
      trim: true,
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    category: {
      type: String,
      enum: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Marketing',
        'Sales',
        'Engineering',
        'Design',
        'Human Resources',
        'Customer Service',
        'Operations',
        'Other',
        '',
      ],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', ''],
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', ''],
    },
    minSalary: {
      type: Number,
    },
    requiredSkills: [String],
    frequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'daily',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSent: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
jobAlertSchema.index({ user: 1, isActive: 1 });

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);

export default JobAlert;
