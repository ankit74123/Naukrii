import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const getProfileLink = () => {
    if (user?.role === 'employer') return '/employer/profile';
    if (user?.role === 'jobseeker') return '/profile';
    return '/dashboard';
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Briefcase className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Naukrii</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className="text-gray-700 hover:text-primary-600 transition-colors">
              Find Jobs
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>

                <Link to="/messages" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Messages
                </Link>

                {user?.role === 'jobseeker' && (
                  <>
                    <Link to="/resume-builder" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Resume
                    </Link>
                    <Link to="/jobseeker/my-applications" className="text-gray-700 hover:text-primary-600 transition-colors">
                      My Applications
                    </Link>
                    <Link to="/saved-jobs" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Saved Jobs
                    </Link>
                    <Link to="/job-alerts" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Job Alerts
                    </Link>
                  </>
                )}

                {user?.role === 'employer' && (
                  <>
                    <Link to="/employer/my-jobs" className="text-gray-700 hover:text-primary-600 transition-colors">
                      My Jobs
                    </Link>
                    <Link to="/employer/manage-applications" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Applications
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Admin Dashboard
                    </Link>
                    <Link to="/admin/users" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Users
                    </Link>
                    <Link to="/admin/jobs" className="text-gray-700 hover:text-primary-600 transition-colors">
                      Jobs
                    </Link>
                  </>
                )}
                
                <Link 
                  to={getProfileLink()} 
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>

                {/* Notification Dropdown */}
                <NotificationDropdown />

                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-3">
                <Link
                  to="/jobs"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Jobs
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/messages"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Messages
                    </Link>

                    {user?.role === 'jobseeker' && (
                      <>
                        <Link
                          to="/resume-builder"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Resume
                        </Link>
                        <Link
                          to="/jobseeker/my-applications"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Applications
                        </Link>
                        <Link
                          to="/saved-jobs"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Saved Jobs
                        </Link>
                        <Link
                          to="/job-alerts"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Job Alerts
                        </Link>
                      </>
                    )}

                    {user?.role === 'employer' && (
                      <>
                        <Link
                          to="/employer/my-jobs"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Jobs
                        </Link>
                        <Link
                          to="/employer/manage-applications"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Applications
                        </Link>
                      </>
                    )}

                    {user?.role === 'admin' && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/users"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Users
                        </Link>
                        <Link
                          to="/admin/jobs"
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Jobs
                        </Link>
                      </>
                    )}
                    
                    <Link
                      to={getProfileLink()}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <div className="px-4 py-2 border-t border-gray-200">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
