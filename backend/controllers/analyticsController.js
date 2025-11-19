import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Get employer analytics
// @route   GET /api/analytics/employer
// @access  Private (Employer)
export const getEmployerAnalytics = async (req, res, next) => {
  try {
    const employerId = req.user.id;

    // Total jobs posted
    const totalJobs = await Job.countDocuments({ employer: employerId });
    const activeJobs = await Job.countDocuments({ employer: employerId, status: 'open' });

    // Applications stats
    const totalApplications = await Application.countDocuments({ employer: employerId });
    const applicationsByStatus = await Application.aggregate([
      { $match: { employer: mongoose.Types.ObjectId(employerId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top performing jobs
    const topJobs = await Application.aggregate([
      { $match: { employer: mongoose.Types.ObjectId(employerId) } },
      { $group: { _id: '$job', applicationCount: { $sum: 1 } } },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      { $unwind: '$jobDetails' },
    ]);

    // Applications over time
    const applicationsOverTime = await Application.aggregate([
      { $match: { employer: mongoose.Types.ObjectId(employerId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        applicationsByStatus,
        topJobs,
        applicationsOverTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job seeker analytics
// @route   GET /api/analytics/jobseeker
// @access  Private (Job Seeker)
export const getJobSeekerAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total applications
    const totalApplications = await Application.countDocuments({ applicant: userId });

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $match: { applicant: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Applications over time
    const applicationsOverTime = await Application.aggregate([
      { $match: { applicant: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Response rate
    const respondedApplications = await Application.countDocuments({
      applicant: userId,
      status: { $ne: 'pending' },
    });
    const responseRate = totalApplications > 0 ? (respondedApplications / totalApplications) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        applicationsByStatus,
        applicationsOverTime,
        responseRate: responseRate.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};
