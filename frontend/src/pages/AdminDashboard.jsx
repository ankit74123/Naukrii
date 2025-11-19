import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import adminService from '../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      change: `+${stats?.users?.newThisMonth || 0} this month`,
      icon: Users,
      color: 'blue',
      link: '/admin/users'
    },
    {
      title: 'Job Seekers',
      value: stats?.users?.jobSeekers || 0,
      icon: Users,
      color: 'green',
      link: '/admin/users?role=jobseeker'
    },
    {
      title: 'Employers',
      value: stats?.users?.employers || 0,
      icon: Users,
      color: 'purple',
      link: '/admin/users?role=employer'
    },
    {
      title: 'Total Jobs',
      value: stats?.jobs?.total || 0,
      change: `+${stats?.jobs?.newThisMonth || 0} this month`,
      icon: Briefcase,
      color: 'indigo',
      link: '/admin/jobs'
    },
    {
      title: 'Active Jobs',
      value: stats?.jobs?.active || 0,
      icon: Briefcase,
      color: 'cyan',
      link: '/admin/jobs?status=active'
    },
    {
      title: 'Total Applications',
      value: stats?.applications?.total || 0,
      change: `+${stats?.applications?.newThisMonth || 0} this month`,
      icon: FileText,
      color: 'orange'
    },
    {
      title: 'Pending Applications',
      value: stats?.applications?.pending || 0,
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Accepted Applications',
      value: stats?.applications?.accepted || 0,
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, jobs, and monitor platform activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const CardContent = (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {card.change && (
                    <span className="text-xs text-green-600 font-medium">
                      {card.change}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {card.value.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">{card.title}</p>
              </motion.div>
            );

            return card.link ? (
              <Link key={index} to={card.link}>
                {CardContent}
              </Link>
            ) : (
              CardContent
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">View and manage all users</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/jobs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Briefcase className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Job Moderation</h3>
                  <p className="text-sm text-gray-600">Review and manage job postings</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/admin/analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View detailed analytics</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentUsers?.map((user) => (
                <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      user.role === 'jobseeker' ? 'bg-green-100 text-green-700' :
                      user.role === 'employer' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <p className="text-center text-gray-500 py-4">No recent users</p>
              )}
            </div>
          </motion.div>

          {/* Recent Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
              <Link to="/admin/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentJobs?.map((job) => (
                <div key={job._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' :
                      job.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentJobs || stats.recentJobs.length === 0) && (
                <p className="text-center text-gray-500 py-4">No recent jobs</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Categories */}
        {stats?.topCategories && stats.topCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Job Categories</h2>
            <div className="space-y-3">
              {stats.topCategories.map((category, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-32">{category._id}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ 
                        width: `${(category.count / stats.jobs.total) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
