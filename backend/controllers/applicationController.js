import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { ErrorResponse } from '../middleware/error.js';
import { createNotification } from './notificationController.js';

// @desc    Submit job application
// @route   POST /api/applications
// @access  Private (Job Seeker only)
export const submitApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return next(new ErrorResponse('Please provide a job ID', 400));
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    // Check if job is still open
    if (job.status !== 'open') {
      return next(new ErrorResponse('This job is no longer accepting applications', 400));
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });

    if (existingApplication) {
      return next(new ErrorResponse('You have already applied for this job', 400));
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      employer: job.employer,
      coverLetter,
    });

    // Populate application data
    await application.populate([
      { path: 'job', select: 'title company location' },
      { path: 'applicant', select: 'name email phone skills experience education' },
    ]);

    // Create notification for employer
    await createNotification({
      recipient: job.employer,
      sender: req.user.id,
      type: 'application',
      title: 'New Job Application',
      message: `${req.user.name} applied for ${job.title}`,
      link: `/employer/manage-applications?jobId=${jobId}`,
      relatedJob: jobId,
      relatedApplication: application._id,
      priority: 'normal',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a specific job (Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer - job owner only)
export const getApplicationsByJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to view these applications', 401));
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone avatar skills experience education')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications by logged in job seeker
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker only)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location jobType salary status')
      .populate('employer', 'name companyName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for employer's jobs
// @route   GET /api/applications/employer
// @access  Private (Employer only)
export const getEmployerApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ employer: req.user.id })
      .populate('applicant', 'name email phone avatar skills experience')
      .populate('job', 'title location jobType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone avatar skills experience education resume')
      .populate('job', 'title description company location jobType salary requiredSkills')
      .populate('employer', 'name companyName email');

    if (!application) {
      return next(new ErrorResponse('Application not found', 404));
    }

    // Check if user is authorized to view
    if (
      application.applicant._id.toString() !== req.user.id &&
      application.employer._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new ErrorResponse('Not authorized to view this application', 401));
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer - job owner only)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    let application = await Application.findById(req.params.id);

    if (!application) {
      return next(new ErrorResponse('Application not found', 404));
    }

    // Check if user is the employer
    if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this application', 401));
    }

    const oldStatus = application.status;
    application.status = status || application.status;
    if (notes) application.notes = notes;

    await application.save();

    await application.populate([
      { path: 'applicant', select: 'name email phone' },
      { path: 'job', select: 'title' },
    ]);

    // Create notification for applicant if status changed
    if (oldStatus !== application.status) {
      const statusMessages = {
        shortlisted: `Great news! Your application for ${application.job.title} has been shortlisted.`,
        interviewed: `Your application for ${application.job.title} is moving to the interview stage.`,
        accepted: `Congratulations! Your application for ${application.job.title} has been accepted.`,
        rejected: `Thank you for your interest. Unfortunately, your application for ${application.job.title} was not successful this time.`,
      };

      await createNotification({
        recipient: application.applicant._id,
        sender: req.user.id,
        type: 'status_update',
        title: 'Application Status Update',
        message: statusMessages[application.status] || `Your application status has been updated to ${application.status}.`,
        link: `/jobseeker/my-applications`,
        relatedJob: application.job._id,
        relatedApplication: application._id,
        priority: application.status === 'accepted' ? 'high' : 'normal',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Applicant or Admin only)
export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new ErrorResponse('Application not found', 404));
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this application', 401));
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application statistics for employer
// @route   GET /api/applications/employer/stats
// @access  Private (Employer only)
export const getApplicationStats = async (req, res, next) => {
  try {
    const total = await Application.countDocuments({ employer: req.user.id });
    const pending = await Application.countDocuments({ employer: req.user.id, status: 'pending' });
    const reviewed = await Application.countDocuments({ employer: req.user.id, status: 'reviewed' });
    const accepted = await Application.countDocuments({ employer: req.user.id, status: 'accepted' });
    const rejected = await Application.countDocuments({ employer: req.user.id, status: 'rejected' });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        reviewed,
        accepted,
        rejected,
      },
    });
  } catch (error) {
    next(error);
  }
};
