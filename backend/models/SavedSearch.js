import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    searchCriteria: {
      search: String,
      category: String,
      jobType: String,
      location: String,
      minSalary: Number,
      maxSalary: Number,
      skills: [String],
      experienceLevel: String,
      isRemote: Boolean,
      postedWithin: Number,
    },
    notifyOnMatch: {
      type: Boolean,
      default: false,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
savedSearchSchema.index({ user: 1, createdAt: -1 });

const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);

export default SavedSearch;
