import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    logo: String,
    coverImage: String,
    industry: String,
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    foundedYear: Number,
    website: String,
    description: String,
    mission: String,
    culture: String,
    benefits: [String],
    locations: [{
      city: String,
      state: String,
      country: String,
      isHeadquarters: Boolean,
    }],
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },
    contactEmail: String,
    contactPhone: String,
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for active jobs
companySchema.virtual('activeJobs', {
  ref: 'Job',
  localField: 'employer',
  foreignField: 'employer',
  match: { status: 'open' },
  count: true,
});

const Company = mongoose.model('Company', companySchema);

export default Company;
