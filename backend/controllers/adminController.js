import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    // User Statistics
    const totalUsers = await User.countDocuments();
    const jobSeekers = await User.countDocuments({ role: 'jobseeker' });
    const employers = await User.countDocuments({ role: 'employer' });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // Job Statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const newJobsThisMonth = await Job.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // Application Statistics
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const newApplicationsThisMonth = await Application.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // Recent Users (last 5)
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Jobs (last 5)
    const recentJobs = await Job.find()
      .select('title company category status createdAt')
      .populate('employer', 'name companyName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top Categories
    const topCategories = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Applications by Status
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          jobSeekers,
          employers,
          newThisMonth: newUsersThisMonth
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          newThisMonth: newJobsThisMonth
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          newThisMonth: newApplicationsThisMonth
        },
        recentUsers,
        recentJobs,
        topCategories,
        applicationsByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get user's jobs if employer
    let jobs = [];
    if (user.role === 'employer') {
      jobs = await Job.find({ employer: user._id })
        .select('title category status createdAt')
        .sort({ createdAt: -1 });
    }

    // Get user's applications if job seeker
    let applications = [];
    if (user.role === 'jobseeker') {
      applications = await Application.find({ applicant: user._id })
        .select('job status createdAt')
        .populate('job', 'title company')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        jobs,
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Prevent deactivating yourself
    if (req.user.id === req.params.id) {
      return next(new ErrorResponse('You cannot deactivate your own account', 400));
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Prevent deleting yourself
    if (req.user.id === req.params.id) {
      return next(new ErrorResponse('You cannot delete your own account', 400));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for moderation
// @route   GET /api/admin/jobs
// @access  Private (Admin)
export const getAllJobsForAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('employer', 'name email companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job status
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin)
export const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'closed', 'suspended'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('employer', 'name email companyName');

    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User registrations over time
    const userRegistrations = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Job postings over time
    const jobPostings = await Job.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Applications over time
    const applicationsOverTime = await Application.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Jobs by category
    const jobsByCategory = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Jobs by type
    const jobsByType = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        jobPostings,
        applicationsOverTime,
        jobsByCategory,
        jobsByType
      }
    });
  } catch (error) {
    next(error);
  }
};
