import express from 'express';
import {
  createSavedSearch,
  getSavedSearches,
  getSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
} from '../controllers/savedSearchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getSavedSearches).post(createSavedSearch);

router.route('/:id').get(getSavedSearch).put(updateSavedSearch).delete(deleteSavedSearch);

export default router;
