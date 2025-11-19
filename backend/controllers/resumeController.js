import Resume from '../models/Resume.js';
import { ErrorResponse } from '../middleware/error.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get user's resume data
// @route   GET /api/resume
// @access  Private (Job Seeker)
export const getMyResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      // Create empty resume if doesn't exist
      resume = await Resume.create({
        user: req.user.id,
        title: 'My Resume',
        workExperience: [],
        education: [],
        certifications: [],
        projects: [],
        skills: []
      });
    }
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resume
// @access  Private (Job Seeker)
export const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      resume = await Resume.create({
        user: req.user.id,
        ...req.body
      });
    } else {
      resume = await Resume.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add work experience
// @route   POST /api/resume/work-experience
// @access  Private (Job Seeker)
export const addWorkExperience = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    resume.workExperience.push(req.body);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update work experience
// @route   PUT /api/resume/work-experience/:id
// @access  Private (Job Seeker)
export const updateWorkExperience = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    const experience = resume.workExperience.id(req.params.id);
    
    if (!experience) {
      return next(new ErrorResponse('Work experience not found', 404));
    }
    
    Object.assign(experience, req.body);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work experience
// @route   DELETE /api/resume/work-experience/:id
// @access  Private (Job Seeker)
export const deleteWorkExperience = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    resume.workExperience.pull(req.params.id);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add education
// @route   POST /api/resume/education
// @access  Private (Job Seeker)
export const addEducation = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    resume.education.push(req.body);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update education
// @route   PUT /api/resume/education/:id
// @access  Private (Job Seeker)
export const updateEducation = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    const education = resume.education.id(req.params.id);
    
    if (!education) {
      return next(new ErrorResponse('Education not found', 404));
    }
    
    Object.assign(education, req.body);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete education
// @route   DELETE /api/resume/education/:id
// @access  Private (Job Seeker)
export const deleteEducation = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    resume.education.pull(req.params.id);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume document
// @route   POST /api/resume/upload
// @access  Private (Job Seeker)
export const uploadResumeDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    // Delete old file if exists
    if (resume.resumeDocument && resume.resumeDocument.path) {
      const oldPath = path.join(__dirname, '..', resume.resumeDocument.path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    resume.resumeDocument = {
      filename: req.file.filename,
      path: `uploads/resumes/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: Date.now()
    };
    
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload additional document
// @route   POST /api/resume/upload-document
// @access  Private (Job Seeker)
export const uploadAdditionalDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    const document = {
      name: req.body.name || req.file.originalname,
      filename: req.file.filename,
      path: `uploads/documents/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: Date.now()
    };
    
    resume.additionalDocuments.push(document);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete additional document
// @route   DELETE /api/resume/document/:id
// @access  Private (Job Seeker)
export const deleteAdditionalDocument = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
    }
    
    const document = resume.additionalDocuments.id(req.params.id);
    
    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }
    
    // Delete file
    const filePath = path.join(__dirname, '..', document.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    resume.additionalDocuments.pull(req.params.id);
    await resume.save();
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resume by user ID (for employers)
// @route   GET /api/resume/user/:userId
// @access  Private (Employer)
export const getResumeByUserId = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.params.userId, isPublic: true })
      .populate('user', 'name email');
    
    if (!resume) {
      return next(new ErrorResponse('Resume not found or not public', 404));
    }
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download resume document
// @route   GET /api/resume/download/:userId
// @access  Private
export const downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.params.userId });
    
    if (!resume || !resume.resumeDocument) {
      return next(new ErrorResponse('Resume document not found', 404));
    }
    
    // Check if user is owner or employer
    if (req.user.id !== req.params.userId && req.user.role !== 'employer') {
      return next(new ErrorResponse('Not authorized to download this resume', 403));
    }
    
    const filePath = path.join(__dirname, '..', resume.resumeDocument.path);
    
    if (!fs.existsSync(filePath)) {
      return next(new ErrorResponse('File not found', 404));
    }
    
    res.download(filePath, resume.resumeDocument.filename);
  } catch (error) {
    next(error);
  }
};
