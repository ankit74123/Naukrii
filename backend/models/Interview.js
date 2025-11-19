import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person'],
      default: 'video',
    },
    location: String, // For in-person interviews
    meetingLink: String, // For video interviews
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    notes: String,
    feedback: {
      rating: Number,
      comments: String,
      strengths: [String],
      weaknesses: [String],
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewSchema.index({ employer: 1, scheduledDate: 1 });
interviewSchema.index({ candidate: 1, scheduledDate: 1 });
interviewSchema.index({ application: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
