import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, MapPin, Briefcase, DollarSign, Calendar, Trash2, StickyNote, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import savedJobService from '../services/savedJobService';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState(null);
  const [notesModal, setNotesModal] = useState(null);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await savedJobService.getSavedJobs();
      setSavedJobs(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await savedJobService.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(saved => saved.job._id !== jobId));
      toast.success('Job removed from saved jobs');
      setDeleteModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove job');
    }
  };

  const handleUpdateNotes = async (jobId) => {
    try {
      await savedJobService.updateSavedJobNotes(jobId, notes);
      setSavedJobs(savedJobs.map(saved => 
        saved.job._id === jobId ? { ...saved, notes } : saved
      ));
      toast.success('Notes updated successfully');
      setNotesModal(null);
      setNotes('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update notes');
    }
  };

  const openNotesModal = (savedJob) => {
    setNotesModal(savedJob.job._id);
    setNotes(savedJob.notes || '');
  };

  const filteredJobs = savedJobs.filter(saved => {
    if (filter === 'all') return true;
    return saved.job.category === filter;
  });

  const categories = [...new Set(savedJobs.map(saved => saved.job.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
          <p className="text-gray-600">
            {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No saved jobs yet</h2>
            <p className="text-gray-600 mb-6">
              Start saving jobs you're interested in to review them later
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </button>
          </motion.div>
        ) : (
          <>
            {/* Filters */}
            {categories.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All ({savedJobs.length})
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category} ({savedJobs.filter(s => s.job.category === category).length})
                  </button>
                ))}
              </div>
            )}

            {/* Jobs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredJobs.map((savedJob) => (
                  <motion.div
                    key={savedJob._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 cursor-pointer" onClick={() => navigate(`/jobs/${savedJob.job._id}`)}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                          {savedJob.job.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{savedJob.job.company}</p>
                      </div>
                      <button
                        onClick={() => setDeleteModal(savedJob.job._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove from saved"
                      >
                        <Bookmark className="w-6 h-6 fill-current" />
                      </button>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {savedJob.job.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {savedJob.job.jobType} • {savedJob.job.experienceLevel}
                      </div>
                      {savedJob.job.salary && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {savedJob.job.salary}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        Saved {new Date(savedJob.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        {savedJob.job.category}
                      </span>
                    </div>

                    {/* Notes Section */}
                    {savedJob.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                          <StickyNote className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{savedJob.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/jobs/${savedJob.job._id}`)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => openNotesModal(savedJob)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        title="Add/Edit notes"
                      >
                        <StickyNote className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Remove Saved Job</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this job from your saved jobs?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnsaveJob(deleteModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {notesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setNotesModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <StickyNote className="w-6 h-6 text-yellow-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Job Notes</h3>
                </div>
                <button
                  onClick={() => setNotesModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add personal notes about this job..."
                className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setNotesModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateNotes(notesModal)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedJobs;
