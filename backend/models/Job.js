import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Please provide job description'],
    },
    responsibilities: [String],
    qualifications: [String],
    requiredSkills: [String],
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager'],
    },
    category: {
      type: String,
      required: [true, 'Please specify job category'],
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
      ],
    },
    jobType: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
      default: 'Full-time',
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site',
    },
    experience: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
      },
    },
    salary: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },
    location: {
      city: String,
      state: String,
      country: String,
      isRemote: {
        type: Boolean,
        default: false,
      },
    },
    skills: [String],
    benefits: [String],
    status: {
      type: String,
      enum: ['open', 'closed', 'on-hold'],
      default: 'open',
    },
    applicationDeadline: {
      type: Date,
    },
    openings: {
      type: Number,
      default: 1,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
jobSchema.index({ category: 1, jobType: 1, 'location.city': 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
