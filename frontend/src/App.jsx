import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import JobSeekerProfile from './pages/JobSeekerProfile';
import EmployerProfile from './pages/EmployerProfile';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import ManageApplications from './pages/ManageApplications';
import Messages from './pages/Messages';
import SavedJobs from './pages/SavedJobs';
import JobAlerts from './pages/JobAlerts';
import ResumeBuilder from './pages/ResumeBuilder';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import JobModeration from './pages/JobModeration';
import Notifications from './pages/Notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <JobSeekerProfile />
              </ProtectedRoute>
            } />
            <Route path="/employer/profile" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerProfile />
              </ProtectedRoute>
            } />
            <Route path="/employer/post-job" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/employer/my-jobs" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <MyJobs />
              </ProtectedRoute>
            } />
            <Route path="/jobseeker/my-applications" element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="/employer/manage-applications" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <ManageApplications />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/saved-jobs" element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <SavedJobs />
              </ProtectedRoute>
            } />
            <Route path="/job-alerts" element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <JobAlerts />
              </ProtectedRoute>
            } />
            <Route path="/resume-builder" element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <ResumeBuilder />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <JobModeration />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
