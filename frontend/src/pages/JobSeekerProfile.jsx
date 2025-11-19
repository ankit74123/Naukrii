import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { updateProfile, addExperience, addEducation, deleteExperience, deleteEducation, uploadProfilePicture } from '../services/userService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, MapPin, Phone, Plus, Trash2, Edit, Camera } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const JobSeekerProfile = () => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: {
      city: '',
      state: '',
      country: '',
    },
    skills: [],
  });

  const [expData, setExpData] = useState({
    title: '',
    company: '',
    location: '',
    from: '',
    to: '',
    current: false,
    description: '',
  });

  const [eduData, setEduData] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    from: '',
    to: '',
    current: false,
    description: '',
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || { city: '', state: '', country: '' },
        skills: user.skills || [],
      });
    }
  }, [user]);

  if (!isAuthenticated || user?.role !== 'jobseeker') {
    return <Navigate to="/login" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await updateProfile(formData);
      updateUser(data.data);
      // Update local formData to match the saved user data
      setFormData({
        name: data.data.name || '',
        phone: data.data.phone || '',
        location: data.data.location || { city: '', state: '', country: '' },
        skills: data.data.skills || [],
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await addExperience(expData);
      updateUser({ ...user, experience: data.data });
      toast.success('Experience added successfully!');
      setShowExpForm(false);
      setExpData({
        title: '',
        company: '',
        location: '',
        from: '',
        to: '',
        current: false,
        description: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (expId) => {
    try {
      const { data } = await deleteExperience(expId);
      updateUser({ ...user, experience: data.data });
      toast.success('Experience deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete experience');
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await addEducation(eduData);
      updateUser({ ...user, education: data.data });
      toast.success('Education added successfully!');
      setShowEduForm(false);
      setEduData({
        school: '',
        degree: '',
        fieldOfStudy: '',
        from: '',
        to: '',
        current: false,
        description: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add education');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = async (eduId) => {
    try {
      const { data } = await deleteEducation(eduId);
      updateUser({ ...user, education: data.data });
      toast.success('Education deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete education');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const { data } = await uploadProfilePicture(file);
      updateUser(data.data);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                {user?.avatar?.url ? (
                  <img
                    src={`http://localhost:5000${user.avatar.url}`}
                    alt={user?.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-primary-500"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary-600" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 h-7 w-7 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 shadow-lg disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                </motion.button>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Edit className="h-4 w-4" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, state: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, country: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{user?.phone || 'No phone number added'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>
                  {user?.location?.city && user?.location?.country
                    ? `${user.location.city}, ${user.location.state || ''} ${user.location.country}`
                    : 'No location added'}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
          {editing && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <motion.button
                type="button"
                onClick={handleAddSkill}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.skills.length > 0 ? (
              formData.skills.map((skill, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {skill}
                  {editing && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-primary-900"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </motion.span>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Experience
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExpForm(!showExpForm)}
              className="flex items-center gap-2 px-3 py-1 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </motion.button>
          </div>

          {showExpForm && (
            <form onSubmit={handleAddExperience} className="mb-6 p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={expData.title}
                  onChange={(e) => setExpData({ ...expData, title: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={expData.company}
                  onChange={(e) => setExpData({ ...expData, company: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <input
                type="text"
                placeholder="Location"
                value={expData.location}
                onChange={(e) => setExpData({ ...expData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="month"
                  placeholder="From"
                  value={expData.from}
                  onChange={(e) => setExpData({ ...expData, from: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="month"
                  placeholder="To"
                  value={expData.to}
                  onChange={(e) => setExpData({ ...expData, to: e.target.value })}
                  disabled={expData.current}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={expData.current}
                  onChange={(e) => setExpData({ ...expData, current: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Currently working here</span>
              </label>
              <textarea
                placeholder="Description"
                value={expData.description}
                onChange={(e) => setExpData({ ...expData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Experience'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowExpForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {user?.experience?.length > 0 ? (
              user.experience.map((exp) => (
                <div key={exp._id} className="border-l-4 border-primary-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                        {exp.current ? 'Present' : new Date(exp.to).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                      {exp.description && <p className="mt-2 text-gray-600">{exp.description}</p>}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteExperience(exp._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No experience added yet</p>
            )}
          </div>
        </motion.div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Education
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEduForm(!showEduForm)}
              className="flex items-center gap-2 px-3 py-1 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </motion.button>
          </div>

          {showEduForm && (
            <form onSubmit={handleAddEducation} className="mb-6 p-4 border border-gray-200 rounded-lg space-y-4">
              <input
                type="text"
                placeholder="School/University"
                value={eduData.school}
                onChange={(e) => setEduData({ ...eduData, school: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Degree"
                  value={eduData.degree}
                  onChange={(e) => setEduData({ ...eduData, degree: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={eduData.fieldOfStudy}
                  onChange={(e) => setEduData({ ...eduData, fieldOfStudy: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="month"
                  placeholder="From"
                  value={eduData.from}
                  onChange={(e) => setEduData({ ...eduData, from: e.target.value })}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="month"
                  placeholder="To"
                  value={eduData.to}
                  onChange={(e) => setEduData({ ...eduData, to: e.target.value })}
                  disabled={eduData.current}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={eduData.current}
                  onChange={(e) => setEduData({ ...eduData, current: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Currently studying here</span>
              </label>
              <textarea
                placeholder="Description"
                value={eduData.description}
                onChange={(e) => setEduData({ ...eduData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Education'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowEduForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {user?.education?.length > 0 ? (
              user.education.map((edu) => (
                <div key={edu._id} className="border-l-4 border-primary-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                      <p className="text-gray-700">{edu.degree} - {edu.fieldOfStudy}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(edu.from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                        {edu.current ? 'Present' : new Date(edu.to).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      {edu.description && <p className="mt-2 text-gray-600">{edu.description}</p>}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteEducation(edu._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No education added yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobSeekerProfile;
