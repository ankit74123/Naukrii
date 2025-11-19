import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  location: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  current: {
    type: Boolean,
    default: false
  },
  description: String,
  responsibilities: [String]
});

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  fieldOfStudy: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  current: {
    type: Boolean,
    default: false
  },
  grade: String,
  description: String
});

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  issuingOrganization: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  technologies: [String],
  startDate: Date,
  endDate: Date,
  current: {
    type: Boolean,
    default: false
  },
  projectUrl: String,
  githubUrl: String
});

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Information
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 1000
  },
  
  // Contact Information (can override user defaults)
  phone: String,
  location: {
    city: String,
    state: String,
    country: String
  },
  website: String,
  linkedin: String,
  github: String,
  portfolio: String,
  
  // Professional Details
  skills: [String],
  languages: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['Native', 'Fluent', 'Professional', 'Basic']
    }
  }],
  
  workExperience: [workExperienceSchema],
  education: [educationSchema],
  certifications: [certificationSchema],
  projects: [projectSchema],
  
  // Documents
  resumeDocument: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  
  // Additional Documents
  additionalDocuments: [{
    name: String,
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  }],
  
  // Metadata
  isPublic: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
resumeSchema.index({ user: 1 });
resumeSchema.index({ skills: 1 });
resumeSchema.index({ 'location.city': 1, 'location.state': 1 });

// Update lastUpdated on save
resumeSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
