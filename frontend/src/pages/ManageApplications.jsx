import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  Video,
  Filter,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Award,
  MessageCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getEmployerApplications, updateApplicationStatus, getApplicationStats } from '../services/applicationService';
import toast from 'react-hot-toast';

const ManageApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const fetchData = async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        getEmployerApplications(),
        getApplicationStats(),
      ]);
      setApplications(appsRes.data || []);
      setFilteredApplications(appsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      toast.error('Failed to fetch applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter((app) => app.status === statusFilter));
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApp || !updateStatus) return;

    try {
      await updateApplicationStatus(selectedApp._id, updateStatus, notes);
      toast.success('Application status updated successfully');
      setSelectedApp(null);
      setUpdateStatus('');
      setNotes('');
      fetchData();
    } catch (error) {
      toast.error('Failed to update application status');
      console.error(error);
    }
  };

  const openUpdateModal = (application) => {
    setSelectedApp(application);
    setUpdateStatus(application.status);
    setNotes(application.notes || '');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      reviewed: 'text-blue-600 bg-blue-100',
      shortlisted: 'text-purple-600 bg-purple-100',
      interviewed: 'text-indigo-600 bg-indigo-100',
      accepted: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Manage Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage applications for your posted jobs</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col">
              <Clock className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col">
              <Eye className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reviewed || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col">
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.accepted || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col">
              <XCircle className="h-8 w-8 text-red-600 mb-2" />
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter by Status</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
          >
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? 'You haven\'t received any applications yet'
                : `No applications with status: ${statusFilter}`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Applicant Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.applicant?.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail size={16} />
                            {application.applicant?.email}
                          </div>
                          {application.applicant?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={16} />
                              {application.applicant.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <Link
                        to={`/jobs/${application.job?._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Briefcase size={16} />
                        {application.job?.title}
                      </Link>
                      {application.job?.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {application.job.location.city}
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    {application.applicant?.skills && application.applicant.skills.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-2">
                          <Award size={16} className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Skills:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {application.applicant.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {application.coverLetter && (
                      <div className="p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                        <p className="text-sm text-gray-600">{application.coverLetter}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {application.notes && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">Your Notes:</p>
                        <p className="text-sm text-blue-700">{application.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => openUpdateModal(application)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck size={18} />
                      Update Status
                    </button>
                    <button
                      onClick={() => navigate('/messages', { state: { receiverId: application.applicant?._id } })}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Send Message
                    </button>
                    <Link
                      to={`/jobseeker/profile/${application.applicant?._id}`}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <User size={18} />
                      View Profile
                    </Link>
                    <div className="text-xs text-gray-500 text-center mt-2">
                      Applied {formatDate(application.createdAt)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Application Status</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Applicant: <span className="font-medium">{selectedApp.applicant?.name}</span></p>
              <p className="text-sm text-gray-600">Job: <span className="font-medium">{selectedApp.job?.title}</span></p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or feedback for the applicant..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setUpdateStatus('');
                  setNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageApplications;
