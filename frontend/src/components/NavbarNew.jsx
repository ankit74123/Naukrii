import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User, LogOut, Menu, X, ChevronDown, Settings, Bell, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
    setUserMenuOpen(false);
  };

  const getProfileLink = () => {
    if (user?.role === 'employer') return '/employer/profile';
    if (user?.role === 'jobseeker') return '/profile';
    return '/dashboard';
  };

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-4 py-2 text-base font-medium transition-all duration-200 rounded-lg group ${
        isActiveLink(to)
          ? 'text-primary-700 bg-primary-50'
          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
      }`}
    >
      {children}
      {isActiveLink(to) && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50 backdrop-blur-sm bg-white/95"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200"
            >
              <Briefcase className="h-7 w-7 text-white" strokeWidth={2.5} />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
                Naukrii
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-1">Find Your Dream Job</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <NavLink to="/jobs">Find Jobs</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/messages">Messages</NavLink>

                {user?.role === 'jobseeker' && (
                  <>
                    <NavLink to="/resume-builder">Resume</NavLink>
                    <NavLink to="/jobseeker/my-applications">Applications</NavLink>
                    <NavLink to="/saved-jobs">Saved Jobs</NavLink>
                    <NavLink to="/job-alerts">Alerts</NavLink>
                  </>
                )}

                {user?.role === 'employer' && (
                  <>
                    <NavLink to="/employer/my-jobs">My Jobs</NavLink>
                    <NavLink to="/employer/manage-applications">Applications</NavLink>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/employer/post-job"
                        className="ml-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                      >
                        Post a Job
                      </Link>
                    </motion.div>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
                    <NavLink to="/admin/users">Users</NavLink>
                    <NavLink to="/admin/jobs">Jobs</NavLink>
                  </>
                )}

                {/* Notification Dropdown */}
                <div className="ml-2">
                  <NotificationDropdown />
                </div>

                {/* User Menu Dropdown */}
                <div className="relative ml-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                      <User className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                      >
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 px-5 py-4 border-b border-primary-200">
                          <p className="text-base font-bold text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to={getProfileLink()}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <User className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">My Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <Settings className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Settings</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-200">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-5 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-gray-700 font-semibold hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
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
            className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="h-7 w-7" strokeWidth={2.5} /> : <Menu className="h-7 w-7" strokeWidth={2.5} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200 py-4 backdrop-blur-lg"
            >
              <div className="flex flex-col space-y-1">
                <Link
                  to="/jobs"
                  className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                    isActiveLink('/jobs')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Jobs
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                        isActiveLink('/dashboard')
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/messages"
                      className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                        isActiveLink('/messages')
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Messages
                    </Link>

                    {user?.role === 'jobseeker' && (
                      <>
                        <Link
                          to="/resume-builder"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/resume-builder')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Resume Builder
                        </Link>
                        <Link
                          to="/jobseeker/my-applications"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/jobseeker/my-applications')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Applications
                        </Link>
                        <Link
                          to="/saved-jobs"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/saved-jobs')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Saved Jobs
                        </Link>
                        <Link
                          to="/job-alerts"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/job-alerts')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
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
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/employer/my-jobs')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Jobs
                        </Link>
                        <Link
                          to="/employer/manage-applications"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/employer/manage-applications')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Applications
                        </Link>
                        <Link
                          to="/employer/post-job"
                          className="px-4 py-3 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-center shadow-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Post a Job
                        </Link>
                      </>
                    )}

                    {user?.role === 'admin' && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/admin/dashboard')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/users"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/admin/users')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Users
                        </Link>
                        <Link
                          to="/admin/jobs"
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isActiveLink('/admin/jobs')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Jobs
                        </Link>
                      </>
                    )}

                    {/* User Info & Profile */}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                          <User className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                        </div>
                      </div>

                      <Link
                        to={getProfileLink()}
                        className="flex items-center gap-3 px-4 py-3 mt-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">My Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                      </Link>

                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-center shadow-md"
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

      {/* Close dropdown when clicking outside */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;
