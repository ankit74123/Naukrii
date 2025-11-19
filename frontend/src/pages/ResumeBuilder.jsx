import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Save,
  Eye,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import resumeService from '../services/resumeService';

const ResumeBuilder = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState({
    title: '',
    summary: '',
    phone: '',
    location: { city: '', state: '', country: '' },
    website: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const [workExperience, setWorkExperience] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    responsibilities: ''
  });

  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    grade: '',
    description: ''
  });

  const [skills, setSkills] = useState('');

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getMyResume();
      setResume(data);
      
      if (data) {
        setPersonalInfo({
          title: data.title || '',
          summary: data.summary || '',
          phone: data.phone || '',
          location: data.location || { city: '', state: '', country: '' },
          website: data.website || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          portfolio: data.portfolio || ''
        });
        setSkills(data.skills?.join(', ') || '');
      }
    } catch (error) {
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const data = await resumeService.updateResume({
        ...personalInfo,
        skills: skillsArray
      });
      setResume(data);
      toast.success('Personal information updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleAddWorkExperience = async (e) => {
    e.preventDefault();
    try {
      const responsibilities = workExperience.responsibilities
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean);
      
      const experienceData = {
        ...workExperience,
        responsibilities
      };

      if (editingItem) {
        const data = await resumeService.updateWorkExperience(editingItem._id, experienceData);
        setResume(data);
        toast.success('Work experience updated');
      } else {
        const data = await resumeService.addWorkExperience(experienceData);
        setResume(data);
        toast.success('Work experience added');
      }
      
      resetWorkExperienceForm();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteWorkExperience = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work experience?')) return;
    
    try {
      const data = await resumeService.deleteWorkExperience(id);
      setResume(data);
      toast.success('Work experience deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const data = await resumeService.updateEducation(editingItem._id, education);
        setResume(data);
        toast.success('Education updated');
      } else {
        const data = await resumeService.addEducation(education);
        setResume(data);
        toast.success('Education added');
      }
      
      resetEducationForm();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education?')) return;
    
    try {
      const data = await resumeService.deleteEducation(id);
      setResume(data);
      toast.success('Education deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const data = await resumeService.uploadResume(file);
      setResume(data);
      toast.success('Resume uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    }
  };

  const openWorkExperienceModal = (experience = null) => {
    if (experience) {
      setEditingItem(experience);
      setWorkExperience({
        company: experience.company || '',
        position: experience.position || '',
        location: experience.location || '',
        startDate: experience.startDate ? experience.startDate.split('T')[0] : '',
        endDate: experience.endDate ? experience.endDate.split('T')[0] : '',
        current: experience.current || false,
        description: experience.description || '',
        responsibilities: experience.responsibilities?.join('\n') || ''
      });
    }
    setActiveSection('work');
    setShowModal(true);
  };

  const openEducationModal = (edu = null) => {
    if (edu) {
      setEditingItem(edu);
      setEducation({
        institution: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate ? edu.startDate.split('T')[0] : '',
        endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
        current: edu.current || false,
        grade: edu.grade || '',
        description: edu.description || ''
      });
    }
    setActiveSection('education');
    setShowModal(true);
  };

  const resetWorkExperienceForm = () => {
    setWorkExperience({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      responsibilities: ''
    });
    setEditingItem(null);
  };

  const resetEducationForm = () => {
    setEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      grade: '',
      description: ''
    });
    setEditingItem(null);
  };

  const sections = [
    { id: 'personal', icon: User, label: 'Personal Info' },
    { id: 'work', icon: Briefcase, label: 'Work Experience' },
    { id: 'education', icon: GraduationCap, label: 'Education' },
    { id: 'documents', icon: FileText, label: 'Documents' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
          <p className="text-gray-600">Create and manage your professional resume</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                
                <form onSubmit={handleUpdatePersonalInfo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.title}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Summary
                    </label>
                    <textarea
                      value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                      placeholder="Brief description of your professional background..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={personalInfo.website}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={personalInfo.location.city}
                        onChange={(e) => setPersonalInfo({
                          ...personalInfo,
                          location: { ...personalInfo.location, city: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={personalInfo.location.state}
                        onChange={(e) => setPersonalInfo({
                          ...personalInfo,
                          location: { ...personalInfo.location, state: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={personalInfo.location.country}
                        onChange={(e) => setPersonalInfo({
                          ...personalInfo,
                          location: { ...personalInfo.location, country: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                      <input
                        type="url"
                        value={personalInfo.github}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                      <input
                        type="url"
                        value={personalInfo.portfolio}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills (comma-separated)
                    </label>
                    <textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="JavaScript, React, Node.js, MongoDB, etc."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Personal Information
                  </button>
                </form>
              </motion.div>
            )}

            {/* Work Experience Section */}
            {activeSection === 'work' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                  <button
                    onClick={() => openWorkExperienceModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Experience
                  </button>
                </div>

                <div className="space-y-4">
                  {resume?.workExperience?.map((exp) => (
                    <div key={exp._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(exp.startDate).toLocaleDateString()} - {
                              exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()
                            }
                          </p>
                          {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openWorkExperienceModal(exp)}
                            className="text-blue-600 hover:text-blue-700 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkExperience(exp._id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!resume?.workExperience || resume.workExperience.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No work experience added yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Education Section */}
            {activeSection === 'education' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                  <button
                    onClick={() => openEducationModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Education
                  </button>
                </div>

                <div className="space-y-4">
                  {resume?.education?.map((edu) => (
                    <div key={edu._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-600">{edu.institution}</p>
                          {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                          <p className="text-sm text-gray-500">
                            {new Date(edu.startDate).toLocaleDateString()} - {
                              edu.current ? 'Present' : new Date(edu.endDate).toLocaleDateString()
                            }
                          </p>
                          {edu.grade && <p className="text-gray-700 mt-2">Grade: {edu.grade}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEducationModal(edu)}
                            className="text-blue-600 hover:text-blue-700 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEducation(edu._id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!resume?.education || resume.education.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No education added yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Document</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Upload your resume (PDF or DOCX, max 5MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>

                {resume?.resumeDocument && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{resume.resumeDocument.filename}</p>
                          <p className="text-sm text-gray-600">
                            Uploaded {new Date(resume.resumeDocument.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Work Experience Modal */}
      <AnimatePresence>
        {showModal && activeSection === 'work' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {
              setShowModal(false);
              resetWorkExperienceForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} Work Experience
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetWorkExperienceForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddWorkExperience} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      value={workExperience.company}
                      onChange={(e) => setWorkExperience({ ...workExperience, company: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input
                      type="text"
                      value={workExperience.position}
                      onChange={(e) => setWorkExperience({ ...workExperience, position: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={workExperience.location}
                    onChange={(e) => setWorkExperience({ ...workExperience, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={workExperience.startDate}
                      onChange={(e) => setWorkExperience({ ...workExperience, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={workExperience.endDate}
                      onChange={(e) => setWorkExperience({ ...workExperience, endDate: e.target.value })}
                      disabled={workExperience.current}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="current"
                    checked={workExperience.current}
                    onChange={(e) => setWorkExperience({ ...workExperience, current: e.target.checked, endDate: '' })}
                    className="mr-2"
                  />
                  <label htmlFor="current" className="text-sm text-gray-700">I currently work here</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={workExperience.description}
                    onChange={(e) => setWorkExperience({ ...workExperience, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    value={workExperience.responsibilities}
                    onChange={(e) => setWorkExperience({ ...workExperience, responsibilities: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Developed and maintained web applications&#10;Led a team of 5 developers&#10;Improved system performance by 40%"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetWorkExperienceForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add'} Experience
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education Modal */}
      <AnimatePresence>
        {showModal && activeSection === 'education' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {
              setShowModal(false);
              resetEducationForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} Education
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetEducationForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddEducation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                    <input
                      type="text"
                      value={education.institution}
                      onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                    <input
                      type="text"
                      value={education.degree}
                      onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={education.fieldOfStudy}
                    onChange={(e) => setEducation({ ...education, fieldOfStudy: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={education.startDate}
                      onChange={(e) => setEducation({ ...education, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={education.endDate}
                      onChange={(e) => setEducation({ ...education, endDate: e.target.value })}
                      disabled={education.current}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="current-edu"
                    checked={education.current}
                    onChange={(e) => setEducation({ ...education, current: e.target.checked, endDate: '' })}
                    className="mr-2"
                  />
                  <label htmlFor="current-edu" className="text-sm text-gray-700">I currently study here</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade/GPA</label>
                  <input
                    type="text"
                    value={education.grade}
                    onChange={(e) => setEducation({ ...education, grade: e.target.value })}
                    placeholder="e.g., 3.8/4.0, First Class Honours"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={education.description}
                    onChange={(e) => setEducation({ ...education, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Relevant coursework, achievements, etc."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetEducationForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Add'} Education
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;
