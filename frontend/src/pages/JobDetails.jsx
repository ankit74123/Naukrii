import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Users,
  Globe,
  ArrowLeft,
  Send,
  Calendar,
  CheckCircle,
  Bookmark,
} from 'lucide-react';
import { getJobById } from '../services/jobService';
import savedJobService from '../services/savedJobService';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import ApplyJobModal from '../components/ApplyJobModal';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    if (user?.role === 'jobseeker') {
      checkIfSaved();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const { data } = await getJobById(id);
      setJob(data.data);
    } catch (error) {
      toast.error('Failed to fetch job details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      setCheckingSaved(true);
      const result = await savedJobService.checkIfSaved(id);
      setIsSaved(result.isSaved);
    } catch (error) {
      console.error('Failed to check saved status:', error);
    } finally {
      setCheckingSaved(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (user?.role !== 'jobseeker') {
      toast.error('Only job seekers can save jobs');
      return;
    }

    try {
      if (isSaved) {
        await savedJobService.unsaveJob(id);
        setIsSaved(false);
        toast.success('Job removed from saved');
      } else {
        await savedJobService.saveJob(id);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update saved job');
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for this job');
      navigate('/login');
      return;
    }
    if (user?.role !== 'jobseeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    toast.success('You can view your application in My Applications');
    navigate('/jobseeker/my-applications');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700">
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      <span className="font-medium">
                        {job.employer?.companyName || 'Company Name'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>
                        {job.location?.city && job.location?.state
                          ? `${job.location.city}, ${job.location.state}`
                          : 'Location not specified'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {job.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Job Type</p>
                    <p className="font-medium text-gray-900">{job.jobType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">{formatSalary(job.salary)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{job.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Posted</p>
                    <p className="font-medium text-gray-900">{getTimeAgo(job.createdAt)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </motion.div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Qualifications</h2>
                <ul className="space-y-2">
                  {job.qualifications.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6 sticky top-6"
            >
              <motion.button
                onClick={handleApply}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 mb-3"
              >
                <Send className="h-5 w-5" />
                Apply Now
              </motion.button>

              {/* Bookmark Button */}
              {user?.role === 'jobseeker' && (
                <motion.button
                  onClick={handleBookmarkToggle}
                  disabled={checkingSaved}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium mb-4 transition-colors ${
                    isSaved
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  {checkingSaved ? 'Checking...' : isSaved ? 'Saved' : 'Save Job'}
                </motion.button>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Job Type:</span>
                  <span className="font-medium text-gray-900">{job.jobType}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-medium text-gray-900">{formatSalary(job.salary)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium text-gray-900">
                    {job.experienceLevel || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium text-gray-900">{job.views || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">About Company</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{job.employer?.companyName}</span>
                </div>
                {job.employer?.companyWebsite && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a
                      href={job.employer.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                {job.employer?.companySize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{job.employer.companySize} employees</span>
                  </div>
                )}
                {job.employer?.industry && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{job.employer.industry}</span>
                  </div>
                )}
                {job.employer?.companyDescription && (
                  <p className="text-gray-600 text-sm mt-4 pt-4 border-t border-gray-200">
                    {job.employer.companyDescription}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply Job Modal */}
      <ApplyJobModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={job}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
};

export default JobDetails;
