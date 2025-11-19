import SavedSearch from '../models/SavedSearch.js';
import { ErrorResponse } from '../middleware/error.js';

// @desc    Create saved search
// @route   POST /api/saved-searches
// @access  Private
export const createSavedSearch = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const savedSearch = await SavedSearch.create(req.body);

    res.status(201).json({
      success: true,
      data: savedSearch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved searches for user
// @route   GET /api/saved-searches
// @access  Private
export const getSavedSearches = async (req, res, next) => {
  try {
    const savedSearches = await SavedSearch.find({ user: req.user.id }).sort({ lastUsed: -1 });

    res.status(200).json({
      success: true,
      count: savedSearches.length,
      data: savedSearches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single saved search
// @route   GET /api/saved-searches/:id
// @access  Private
export const getSavedSearch = async (req, res, next) => {
  try {
    const savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      return next(new ErrorResponse('Saved search not found', 404));
    }

    if (savedSearch.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Update last used
    savedSearch.lastUsed = Date.now();
    await savedSearch.save();

    res.status(200).json({
      success: true,
      data: savedSearch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update saved search
// @route   PUT /api/saved-searches/:id
// @access  Private
export const updateSavedSearch = async (req, res, next) => {
  try {
    let savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      return next(new ErrorResponse('Saved search not found', 404));
    }

    if (savedSearch.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    savedSearch = await SavedSearch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: savedSearch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete saved search
// @route   DELETE /api/saved-searches/:id
// @access  Private
export const deleteSavedSearch = async (req, res, next) => {
  try {
    const savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      return next(new ErrorResponse('Saved search not found', 404));
    }

    if (savedSearch.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    await savedSearch.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Saved search deleted',
    });
  } catch (error) {
    next(error);
  }
};
