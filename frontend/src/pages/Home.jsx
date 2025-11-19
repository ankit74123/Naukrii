import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-bold mb-6"
            >
              Find Your Dream Job Today
            </motion.h1>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl mb-8 text-primary-100"
            >
              Connect with top employers and discover opportunities that match your skills
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-2 flex"
            >
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="flex-1 px-4 py-3 text-gray-900 outline-none rounded-l"
              />
              <input
                type="text"
                placeholder="Location"
                className="flex-1 px-4 py-3 text-gray-900 outline-none border-l"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-8 py-3 rounded-r hover:bg-primary-700 transition-colors"
              >
                <Search className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="text-center p-6 rounded-lg hover:shadow-xl transition-shadow"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Briefcase className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Browse Jobs</h3>
            <p className="text-gray-600">
              Explore thousands of job opportunities from top companies
            </p>
          </motion.div>
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="text-center p-6 rounded-lg hover:shadow-xl transition-shadow"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Connect with Employers</h3>
            <p className="text-gray-600">
              Build your profile and get noticed by hiring managers
            </p>
          </motion.div>
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="text-center p-6 rounded-lg hover:shadow-xl transition-shadow"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <TrendingUp className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Grow Your Career</h3>
            <p className="text-gray-600">
              Access resources and tools to advance your professional journey
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-gray-100 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 mb-8"
          >
            Join thousands of job seekers finding their perfect role
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 inline-block transition-colors"
            >
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
