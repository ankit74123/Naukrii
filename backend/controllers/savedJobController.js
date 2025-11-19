import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Save a job
// @route   POST /api/saved-jobs/:jobId
// @access  Private (Job Seeker only)
export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({
      user: req.user.id,
      job: jobId,
    });

    if (existingSave) {
      return next(new ErrorResponse('Job already saved', 400));
    }

    const savedJob = await SavedJob.create({
      user: req.user.id,
      job: jobId,
      notes,
    });

    await savedJob.populate('job', 'title company location jobType salary status');

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave a job
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private (Job Seeker only)
export const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({
      user: req.user.id,
      job: jobId,
    });

    if (!savedJob) {
      return next(new ErrorResponse('Saved job not found', 404));
    }

    await savedJob.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job unsaved successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for logged in user
// @route   GET /api/saved-jobs
// @access  Private (Job Seeker only)
export const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate({
        path: 'job',
        select: 'title company description location jobType salary category experienceLevel requiredSkills status createdAt',
        populate: {
          path: 'employer',
          select: 'name companyName email',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out jobs that have been deleted
    const validSavedJobs = savedJobs.filter((saved) => saved.job !== null);

    res.status(200).json({
      success: true,
      count: validSavedJobs.length,
      data: validSavedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if job is saved
// @route   GET /api/saved-jobs/check/:jobId
// @access  Private (Job Seeker only)
export const checkIfSaved = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({
      user: req.user.id,
      job: jobId,
    });

    res.status(200).json({
      success: true,
      data: { isSaved: !!savedJob },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update saved job notes
// @route   PUT /api/saved-jobs/:jobId
// @access  Private (Job Seeker only)
export const updateSavedJobNotes = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;

    const savedJob = await SavedJob.findOne({
      user: req.user.id,
      job: jobId,
    });

    if (!savedJob) {
      return next(new ErrorResponse('Saved job not found', 404));
    }

    savedJob.notes = notes;
    await savedJob.save();

    await savedJob.populate('job', 'title company location jobType salary status');

    res.status(200).json({
      success: true,
      message: 'Notes updated successfully',
      data: savedJob,
    });
  } catch (error) {
    next(error);
  }
};
