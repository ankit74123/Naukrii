import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { getAllJobs } from '../services/jobService';
import savedJobService from '../services/savedJobService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    jobType: '',
    minSalary: '',
  });
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const { user } = useAuthStore();

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'jobseeker') {
      checkSavedJobs();
    }
  }, [currentPage, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        ...filters,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await getAllJobs(params);
      setJobs(data.data);
      setPagination(data.pagination);
      setTotalJobs(data.total);
    } catch (error) {
      toast.error('Failed to fetch jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkSavedJobs = async () => {
    try {
      const savedJobs = await savedJobService.getSavedJobs();
      const savedIds = new Set(savedJobs.map(saved => saved.job._id));
      setSavedJobIds(savedIds);
    } catch (error) {
      console.error('Failed to check saved jobs:', error);
    }
  };

  const handleBookmarkToggle = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();

    if (user?.role !== 'jobseeker') {
      toast.error('Only job seekers can save jobs');
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        await savedJobService.unsaveJob(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.success('Job removed from saved');
      } else {
        await savedJobService.saveJob(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update saved job');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      category: '',
      jobType: '',
      minSalary: '',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Find Your Perfect Job
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-100"
          >
            {totalJobs} jobs available
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Job title, keywords, or company"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Search
              </motion.button>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="City or State"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Engineering">Engineering</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Salary
              </label>
              <input
                type="number"
                value={filters.minSalary}
                onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                placeholder="e.g., 50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {(filters.location || filters.category || filters.jobType || filters.minSalary || searchTerm) && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Job Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/jobs/${job._id}`}>
                    <motion.div
                      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      className="bg-white rounded-lg shadow p-6 h-full cursor-pointer relative"
                    >
                      {/* Bookmark Button */}
                      {user?.role === 'jobseeker' && (
                        <button
                          onClick={(e) => handleBookmarkToggle(e, job._id)}
                          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                          title={savedJobIds.has(job._id) ? 'Remove from saved' : 'Save job'}
                        >
                          <Bookmark
                            className={`h-5 w-5 ${
                              savedJobIds.has(job._id)
                                ? 'fill-blue-600 text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      )}

                      <div className="flex items-start justify-between mb-4 pr-8">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <Building2 className="h-4 w-4" />
                            <span className="text-sm">{job.employer?.companyName || 'Company'}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {job.jobType}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {job.location?.city && job.location?.state
                              ? `${job.location.city}, ${job.location.state}`
                              : 'Location not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatSalary(job.salary)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.category}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.requiredSkills?.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{job.requiredSkills.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Clock className="h-4 w-4" />
                          <span>{getTimeAgo(job.createdAt)}</span>
                        </div>
                        <span className="text-primary-600 font-medium text-sm">
                          View Details →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {(pagination.prev || pagination.next) && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.prev}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.next}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
