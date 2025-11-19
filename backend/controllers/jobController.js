import Job from '../models/Job.js';
import JobAlert from '../models/JobAlert.js';
import { ErrorResponse } from '../middleware/error.js';
import { createNotification } from './notificationController.js';

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Employer only)
export const createJob = async (req, res, next) => {
  try {
    // Add employer to req.body
    req.body.employer = req.user.id;

    const job = await Job.create(req.body);

    // Check for matching job alerts and send notifications
    const jobAlerts = await JobAlert.find({ isActive: true }).populate('user', 'name');
    
    for (const alert of jobAlerts) {
      let matches = true;

      // Check keyword match
      if (alert.keywords && alert.keywords.length > 0) {
        const jobText = `${job.title} ${job.description} ${job.requiredSkills?.join(' ')}`.toLowerCase();
        matches = alert.keywords.some(keyword => jobText.includes(keyword.toLowerCase()));
      }

      // Check location match
      if (matches && alert.location) {
        const jobLocation = `${job.location?.city} ${job.location?.state} ${job.location?.country}`.toLowerCase();
        matches = jobLocation.includes(alert.location.toLowerCase());
      }

      // Check job type match
      if (matches && alert.jobType && alert.jobType !== job.jobType) {
        matches = false;
      }

      // Check category match
      if (matches && alert.category && alert.category !== job.category) {
        matches = false;
      }

      // Check salary match
      if (matches && alert.minSalary && job.salary?.min < alert.minSalary) {
        matches = false;
      }

      // Send notification if job matches alert criteria
      if (matches) {
        await createNotification({
          recipient: alert.user._id,
          type: 'job_alert',
          title: 'New Job Matching Your Alert',
          message: `${job.title} at ${job.company} matches your job alert criteria`,
          link: `/jobs/${job._id}`,
          relatedJob: job._id,
          priority: 'normal',
        });
      }
    }

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs with filters and search
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = async (req, res, next) => {
  try {
    // Build query
    let query = { status: 'open' };

    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by job type
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    // Filter by location (city or state)
    if (req.query.location) {
      query.$or = [
        { 'location.city': { $regex: req.query.location, $options: 'i' } },
        { 'location.state': { $regex: req.query.location, $options: 'i' } },
        { 'location.country': { $regex: req.query.location, $options: 'i' } },
      ];
    }

    // Filter by salary range
    if (req.query.minSalary) {
      query['salary.min'] = { $gte: Number(req.query.minSalary) };
    }
    if (req.query.maxSalary) {
      query['salary.max'] = { $lte: Number(req.query.maxSalary) };
    }

    // Filter by skills
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(',');
      query.requiredSkills = { $in: skillsArray };
    }

    // Filter by experience level
    if (req.query.experienceLevel) {
      query.experienceLevel = req.query.experienceLevel;
    }

    // Filter by posted date range
    if (req.query.postedWithin) {
      const daysAgo = parseInt(req.query.postedWithin);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      query.createdAt = { $gte: date };
    }

    // Filter by remote option
    if (req.query.isRemote !== undefined) {
      query.isRemote = req.query.isRemote === 'true';
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'salary_high':
          sortOption = { 'salary.max': -1 };
          break;
        case 'salary_low':
          sortOption = { 'salary.min': 1 };
          break;
        case 'title':
          sortOption = { title: 1 };
          break;
        case 'company':
          sortOption = { company: 1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('employer', 'name companyName email')
      .sort(sortOption)
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pagination,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employer',
      'name companyName companyWebsite companyDescription companySize industry location email'
    );

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer - job owner only)
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is job owner
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this job`, 401)
      );
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer - job owner only)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is job owner
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to delete this job`, 401)
      );
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by logged in employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
export const getEmployerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job statistics for employer
// @route   GET /api/jobs/employer/stats
// @access  Private (Employer only)
export const getJobStats = async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments({ employer: req.user.id });
    const openJobs = await Job.countDocuments({ employer: req.user.id, status: 'open' });
    const closedJobs = await Job.countDocuments({ employer: req.user.id, status: 'closed' });

    const jobs = await Job.find({ employer: req.user.id });
    const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        openJobs,
        closedJobs,
        totalViews,
      },
    });
  } catch (error) {
    next(error);
  }
};
