import JobAlert from '../models/JobAlert.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Create job alert
// @route   POST /api/job-alerts
// @access  Private (Job Seeker only)
export const createJobAlert = async (req, res, next) => {
  try {
    const alertData = {
      ...req.body,
      user: req.user.id,
    };

    const alert = await JobAlert.create(alertData);

    res.status(201).json({
      success: true,
      message: 'Job alert created successfully',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all job alerts for logged in user
// @route   GET /api/job-alerts
// @access  Private (Job Seeker only)
export const getJobAlerts = async (req, res, next) => {
  try {
    const alerts = await JobAlert.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job alert
// @route   GET /api/job-alerts/:id
// @access  Private (Job Seeker only)
export const getJobAlert = async (req, res, next) => {
  try {
    const alert = await JobAlert.findById(req.params.id);

    if (!alert) {
      return next(new ErrorResponse('Job alert not found', 404));
    }

    // Check if user owns the alert
    if (alert.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this alert', 401));
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job alert
// @route   PUT /api/job-alerts/:id
// @access  Private (Job Seeker only)
export const updateJobAlert = async (req, res, next) => {
  try {
    let alert = await JobAlert.findById(req.params.id);

    if (!alert) {
      return next(new ErrorResponse('Job alert not found', 404));
    }

    // Check if user owns the alert
    if (alert.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this alert', 401));
    }

    alert = await JobAlert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job alert updated successfully',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job alert
// @route   DELETE /api/job-alerts/:id
// @access  Private (Job Seeker only)
export const deleteJobAlert = async (req, res, next) => {
  try {
    const alert = await JobAlert.findById(req.params.id);

    if (!alert) {
      return next(new ErrorResponse('Job alert not found', 404));
    }

    // Check if user owns the alert
    if (alert.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this alert', 401));
    }

    await alert.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job alert deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle job alert active status
// @route   PUT /api/job-alerts/:id/toggle
// @access  Private (Job Seeker only)
export const toggleJobAlert = async (req, res, next) => {
  try {
    const alert = await JobAlert.findById(req.params.id);

    if (!alert) {
      return next(new ErrorResponse('Job alert not found', 404));
    }

    // Check if user owns the alert
    if (alert.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this alert', 401));
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    res.status(200).json({
      success: true,
      message: `Job alert ${alert.isActive ? 'activated' : 'deactivated'} successfully`,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};
