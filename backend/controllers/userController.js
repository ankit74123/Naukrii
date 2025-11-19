import User from '../models/User.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    
    // Common fields for all users
    const allowedFields = [
      'name', 'phone', 'location', 'skills', 'experience', 'education', 
      'companyName', 'companyWebsite', 'companyDescription', 'companySize', 'industry'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Skip empty strings for enum fields to avoid validation errors
        if (field === 'companySize' && req.body[field] === '') {
          return;
        }
        fieldsToUpdate[field] = req.body[field];
      }
    });

    console.log('Fields to update:', fieldsToUpdate);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    console.log('Updated user phone:', user.phone);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    // Return a more detailed error message for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add experience to profile
// @route   POST /api/users/profile/experience
// @access  Private
export const addExperience = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.experience.unshift(req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Experience added successfully',
      data: user.experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete experience from profile
// @route   DELETE /api/users/profile/experience/:exp_id
// @access  Private
export const deleteExperience = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.experience = user.experience.filter(
      exp => exp.id !== req.params.exp_id
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully',
      data: user.experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add education to profile
// @route   POST /api/users/profile/education
// @access  Private
export const addEducation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.education.unshift(req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Education added successfully',
      data: user.education,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete education from profile
// @route   DELETE /api/users/profile/education/:edu_id
// @access  Private
export const deleteEducation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.education = user.education.filter(
      edu => edu.id !== req.params.edu_id
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Education deleted successfully',
      data: user.education,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const user = await User.findById(req.user.id).select('-password');

    // Construct the avatar URL
    const avatarUrl = `/uploads/profiles/${req.file.filename}`;

    user.avatar = {
      public_id: req.file.filename,
      url: avatarUrl,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
