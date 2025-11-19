import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    skill: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    duration: Number, // in minutes
    questions: [{
      question: String,
      type: {
        type: String,
        enum: ['multiple-choice', 'coding', 'text'],
        default: 'multiple-choice',
      },
      options: [String],
      correctAnswer: String,
      points: {
        type: Number,
        default: 10,
      },
    }],
    passingScore: {
      type: Number,
      default: 70,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const assessmentResultSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [{
      question: String,
      answer: String,
      isCorrect: Boolean,
      points: Number,
    }],
    totalScore: Number,
    percentage: Number,
    passed: Boolean,
    timeSpent: Number, // in seconds
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
assessmentResultSchema.index({ user: 1, assessment: 1 });
assessmentResultSchema.index({ user: 1, createdAt: -1 });

export const Assessment = mongoose.model('Assessment', assessmentSchema);
export const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);
