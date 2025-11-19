import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Plus, Edit2, Trash2, X, MapPin, Briefcase, DollarSign, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import jobAlertService from '../services/jobAlertService';

const JobAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    location: { city: '', state: '', country: '' },
    category: '',
    jobType: '',
    experienceLevel: '',
    minSalary: '',
    requiredSkills: '',
    frequency: 'daily'
  });

  const categories = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Other'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await jobAlertService.getJobAlerts();
      setAlerts(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load job alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please provide a name for this alert');
      return;
    }

    try {
      const alertData = {
        ...formData,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        minSalary: formData.minSalary ? Number(formData.minSalary) : undefined,
        location: formData.location.city || formData.location.state || formData.location.country ? formData.location : undefined
      };

      if (editingAlert) {
        await jobAlertService.updateJobAlert(editingAlert._id, alertData);
        setAlerts(alerts.map(a => a._id === editingAlert._id ? { ...a, ...alertData } : a));
        toast.success('Job alert updated successfully');
      } else {
        const newAlert = await jobAlertService.createJobAlert(alertData);
        setAlerts([newAlert, ...alerts]);
        toast.success('Job alert created successfully');
      }

      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job alert');
    }
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      name: alert.name || '',
      keywords: alert.keywords || '',
      location: alert.location || { city: '', state: '', country: '' },
      category: alert.category || '',
      jobType: alert.jobType || '',
      experienceLevel: alert.experienceLevel || '',
      minSalary: alert.minSalary || '',
      requiredSkills: alert.requiredSkills?.join(', ') || '',
      frequency: alert.frequency || 'daily'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await jobAlertService.deleteJobAlert(id);
      setAlerts(alerts.filter(a => a._id !== id));
      toast.success('Job alert deleted successfully');
      setDeleteModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job alert');
    }
  };

  const handleToggle = async (id) => {
    try {
      const updatedAlert = await jobAlertService.toggleJobAlert(id);
      setAlerts(alerts.map(a => a._id === id ? updatedAlert : a));
      toast.success(updatedAlert.isActive ? 'Job alert activated' : 'Job alert paused');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle job alert');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      location: { city: '', state: '', country: '' },
      category: '',
      jobType: '',
      experienceLevel: '',
      minSalary: '',
      requiredSkills: '',
      frequency: 'daily'
    });
    setEditingAlert(null);
    setShowForm(false);
  };

  const activeAlerts = alerts.filter(a => a.isActive).length;

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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Alerts</h1>
            <p className="text-gray-600">
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} • {activeAlerts} active
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        {/* Alert Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
              onClick={resetForm}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-2xl w-full my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAlert ? 'Edit Job Alert' : 'Create New Job Alert'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Alert Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alert Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Frontend Developer Jobs"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="e.g., React, JavaScript, Frontend"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.location.city}
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                        placeholder="City"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.location.state}
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                        placeholder="State"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={formData.location.country}
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                        placeholder="Country"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category and Job Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                      <select
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any Type</option>
                        {jobTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Experience Level and Min Salary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                      <select
                        value={formData.experienceLevel}
                        onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any Level</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary ($)</label>
                      <input
                        type="number"
                        value={formData.minSalary}
                        onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                        placeholder="e.g., 50000"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.requiredSkills}
                      onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                      placeholder="e.g., JavaScript, React, Node.js"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert Frequency
                    </label>
                    <div className="flex gap-4">
                      {['instant', 'daily', 'weekly'].map(freq => (
                        <label key={freq} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value={freq}
                            checked={formData.frequency === freq}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            className="mr-2"
                          />
                          <span className="capitalize">{freq}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingAlert ? 'Update Alert' : 'Create Alert'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No job alerts yet</h2>
            <p className="text-gray-600 mb-6">
              Create alerts to get notified when new jobs matching your criteria are posted
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Alert
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {alerts.map((alert) => (
              <motion.div
                key={alert._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {/* Alert Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${alert.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {alert.isActive ? (
                        <Bell className="w-5 h-5 text-green-600" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                        alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {alert.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(alert._id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                    >
                      {alert.isActive ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(alert)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit alert"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteModal(alert._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Alert Details */}
                <div className="space-y-2 mb-4">
                  {alert.keywords && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{alert.keywords}</span>
                    </div>
                  )}
                  {alert.location && (alert.location.city || alert.location.state || alert.location.country) && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {[alert.location.city, alert.location.state, alert.location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  {(alert.category || alert.jobType || alert.experienceLevel) && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {[alert.category, alert.jobType, alert.experienceLevel]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    </div>
                  )}
                  {alert.minSalary && (
                    <div className="flex items-start text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Min ${alert.minSalary.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {alert.requiredSkills && alert.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {alert.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Frequency Badge */}
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Frequency: <span className="font-medium capitalize">{alert.frequency}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
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
                <h3 className="text-xl font-semibold text-gray-900">Delete Job Alert</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this job alert? You won't receive notifications for matching jobs anymore.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobAlerts;
