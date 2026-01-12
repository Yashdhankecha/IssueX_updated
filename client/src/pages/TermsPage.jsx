import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Users, Lock, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-60 h-60 bg-indigo-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center mb-6">
            <Link
              to="/register"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Registration
            </Link>
          </div>
          
          <motion.div 
            className="flex items-center space-x-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FileText className="text-white" size={28} />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Terms & Conditions
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
        >
          <div className="prose prose-lg max-w-none">
            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                By accessing and using IssueX, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                2. Description of Service
              </h2>
              <p className="text-gray-700 mb-4">
                FixIt is a community-driven platform that allows users to report and track civic issues in their local area. The service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Reporting civic issues with location data</li>
                <li>Viewing and tracking reported issues</li>
                <li>Interactive mapping of civic problems</li>
                <li>Community engagement features</li>
                <li>Administrative tools for local authorities</li>
              </ul>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 text-purple-600 mr-3" />
                3. User Responsibilities
              </h2>
              <p className="text-gray-700 mb-4">
                As a user of IssueX, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and truthful information when reporting issues</li>
                <li>Respect the privacy and rights of others</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not submit false or misleading reports</li>
                <li>Not attempt to gain unauthorized access to the service</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
                4. Content Guidelines
              </h2>
              <p className="text-gray-700 mb-4">
                When submitting reports, you must ensure that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All information provided is accurate and factual</li>
                <li>Photos and images are relevant to the reported issue</li>
                <li>Content does not violate any laws or regulations</li>
                <li>Personal information of others is not included without consent</li>
                <li>Content is not defamatory, harassing, or offensive</li>
              </ul>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                5. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 mb-4">
                We are committed to protecting your privacy. Our data collection and usage practices are outlined in our Privacy Policy. By using this service, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                6. Location Services
              </h2>
              <p className="text-gray-700 mb-4">
                IssueX uses location services to provide relevant issue reports in your area. By using the service, you consent to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Sharing your location data for service functionality</li>
                <li>Allowing the app to access your device's GPS</li>
                <li>Using location data to show nearby civic issues</li>
                <li>Storing location preferences for improved user experience</li>
              </ul>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                7. Intellectual Property
              </h2>
              <p className="text-gray-700 mb-4">
                The IssueX platform, including its design, code, and content, is protected by intellectual property laws. Users retain ownership of their submitted content but grant us a license to use, display, and distribute their reports for the purpose of providing the service.
              </p>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                8. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-4">
                IssueX is provided "as is" without warranties of any kind. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>The accuracy of user-submitted reports</li>
                <li>Actions taken by local authorities based on reports</li>
                <li>Service interruptions or technical issues</li>
                <li>Data loss or security breaches</li>
                <li>Third-party actions or content</li>
              </ul>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 text-gray-600 mr-3" />
                9. Termination
              </h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to terminate or suspend your account at any time for violations of these terms. You may also terminate your account at any time by contacting our support team.
              </p>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                10. Changes to Terms
              </h2>
              <p className="text-gray-700 mb-4">
                We may update these terms from time to time. We will notify users of any material changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </motion.section>

            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 text-purple-600 mr-3" />
                11. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-gray-700">
                  <strong>Email:</strong> developerstripod@gmail.com<br />
                  <strong>Address:</strong> Gujarat,India<br />
                  <strong>Phone:</strong> +91 8799038003
                </p>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage; 