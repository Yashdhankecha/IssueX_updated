import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, CheckCircle, BookOpen, AlertCircle, Users, Scale } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans relative overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center mb-8">
            <Link
              to="/register"
              className="group flex items-center text-slate-400 hover:text-white transition-colors font-medium"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                <ArrowLeft size={16} />
              </div>
              Back to Registration
            </Link>
          </div>
          
          <motion.div 
            className="flex flex-col md:flex-row md:items-center gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 shrink-0">
              <Scale className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                Terms of Service
              </h1>
              <p className="text-slate-400">
                Last updated: <span className="text-blue-400">{new Date().toLocaleDateString()}</span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="bg-[#0B1221]/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {/* Neon Top Border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="prose prose-invert prose-lg max-w-none">
            <Section title="1. Acceptance of Terms" icon={CheckCircle} color="text-green-400">
              By accessing IssueX, you agree to these terms. This platform creates a binding contract between you (the "Operative") and the IssueX network.
            </Section>

            <Section title="2. Service Protocol" icon={BookOpen} color="text-blue-400">
              IssueX is a decentralized civic intelligence network. Our tools allow you to:
              <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300 marker:text-blue-500">
                  <li>Report infrastructure anomalies with geospatial tagging.</li>
                  <li>Track resolution status in real-time.</li>
                  <li>Collaborate with municipal entities.</li>
              </ul>
            </Section>

            <Section title="3. User Conduct" icon={Users} color="text-purple-400">
              As an authorized user, you commit to:
              <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300 marker:text-purple-500">
                  <li>Providing accurate, verifiable data.</li>
                  <li>Respecting the privacy of fellow citizens.</li>
                  <li>Avoiding automated spam or malicious data injection.</li>
              </ul>
            </Section>

            <Section title="4. Data Liability" icon={AlertCircle} color="text-yellow-400">
              While we employ advanced AI verification, IssueX is not liable for:
              <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-300 marker:text-yellow-500">
                  <li>Innacuracies in user-submitted reports.</li>
                  <li>Delays in municipal response times.</li>
                  <li>Third-party system outages.</li>
              </ul>
            </Section>

            <Section title="5. Termination" icon={Shield} color="text-red-400">
              We reserve the right to revoke access credentials for any user violating these protocols. Malicious activity will be reported to relevant authorities.
            </Section>

            {/* Contact Box */}
            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Legal Contact Channel</h3>
                <div className="space-y-2 text-slate-400">
                    <p><span className="text-blue-400 font-semibold">Email:</span> developerstripod@gmail.com</p>
                    <p><span className="text-blue-400 font-semibold">HQ:</span> Gujarat, India</p>
                </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Section = ({ title, children, icon: Icon, color }) => (
    <div className="mb-10 last:mb-0">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Icon className={`w-6 h-6 ${color} mr-3`} />
            {title}
        </h2>
        <div className="text-slate-300 leading-relaxed pl-9">
            {children}
        </div>
    </div>
);

export default TermsPage;