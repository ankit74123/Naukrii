import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
    coverLetter: {
      type: String,
    },
    resume: {
      public_id: String,
      url: String,
    },
    additionalDocuments: [
      {
        name: String,
        public_id: String,
        url: String,
      },
    ],
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    notes: {
      type: String,
    },
    interviewDate: {
      type: Date,
    },
    interviewMode: {
      type: String,
      enum: ['in-person', 'phone', 'video', 'other'],
    },
    interviewLocation: {
      type: String,
    },
    interviewNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
