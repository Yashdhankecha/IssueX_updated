import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Shield, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Activity,
  Globe,
  Bell,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: MapPin,
      title: "Local Tracking",
      description: "Pinpoint issues in your colony or ward on an interactive map and track resolution status."
    },
    {
      icon: Users,
      title: "Community Power",
      description: "Join forces with your RWA and neighbors to highlight problems that matter to your locality."
    },
    {
      icon: Shield,
      title: "Secure & Official",
      description: "Direct channel to Municipal Corporations with data protected by enterprise-grade encryption."
    },
    {
      icon: Bell,
      title: "SMS & App Updates",
      description: "Receive instant notifications when your reported issues are acknowledged by officials."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Report",
      description: "Spot a pothole or garbage pile? Snap a photo, set location, and upload in seconds."
    },
    {
      number: "02",
      title: "Track",
      description: "Watch as your issue is verified and assigned to the local Nagarpalika or department."
    },
    {
      number: "03",
      title: "Resolve",
      description: "Get notified when the work is done. Verify the fix and rate the promptness."
    }
  ];

  const stats = [
    { number: "1 Lakh+", label: "Issues Resolved" },
    { number: "50+", label: "Cities Active" },
    { number: "98%", label: "Citizen Satisfaction" },
    { number: "24h", label: "Avg. Response" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              IssueX
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">How it Works</a>
            <a href="#testimonials" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Impact</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
                 <Link to="/dashboard" className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                    Go to Dashboard
                 </Link>
            ) : (
                <>
                    <Link to="/login" className="text-slate-700 font-medium hover:text-blue-600 transition-colors">
                    Login
                    </Link>
                    <Link 
                    to="/register" 
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all"
                    >
                    Get Started
                    </Link>
                </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CheckCircle size={24} /> : <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-slate-800"></span>
              <span className="block w-6 h-0.5 bg-slate-800"></span>
              <span className="block w-6 h-0.5 bg-slate-800"></span>
            </div>}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col space-y-4"
          >
            <a href="#features" className="text-slate-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-slate-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
            <a href="#testimonials" className="text-slate-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>Impact</a>
            {user ? (
               <Link to="/dashboard" className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-medium">
                  Go to Dashboard
               </Link>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                  <Link to="/login" className="w-full text-center py-2 text-blue-600 font-medium border border-blue-100 rounded-xl">
                  Login
                  </Link>
                  <Link to="/register" className="w-full text-center py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl">
                  Get Started
                  </Link>
              </div>
            )}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 md:pt-32 md:pb-20 overflow-hidden px-4 md:px-0">
        {/* ... (Hero content skipped for brevity) ... */}
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-50 to-transparent -z-10" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-tr from-indigo-50 to-transparent -z-10" />
        
        {/* Abstract shapes */}
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-20 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-400/10 rounded-full blur-3xl -z-10"
        />
        <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-indigo-400/10 rounded-full blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="space-y-6 md:space-y-8 text-center lg:text-left"
          >
            {/* ... (Hero text content) ... */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs md:text-sm font-semibold text-blue-700">Active in 50+ Cities</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.2]"
            >
              Building Better <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-600">
                Communities
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              Empower your neighborhood. Report civic issues, track real-time progress, and collaborate with your local government to create lasting change.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link 
                to="/register" 
                className="px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>Start Reporting</span>
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/map" 
                className="px-8 py-3.5 md:py-4 rounded-full bg-white text-slate-700 border border-slate-200 font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center space-x-2"
              >
                <span>View Live Map</span>
                <Globe size={20} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            {/* 3D Illustration Placeholder - Use CSS/SVG for abstract city representation */}
            <div className="relative w-full aspect-square">
                 <img 
                    src="./pics/landing.jpg" 
                    alt="Clean City Street" 
                    className="rounded-3xl shadow-2xl object-cover w-full h-full transform rotate-3 hover:rotate-0 transition-transform duration-500 border-8 border-white"
                 />
                 <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl flex items-center space-x-4 animate-bounce-slow">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Just Fixed</div>
                        <div className="font-bold text-slate-900">Road repaired in Indiranagar</div>
                    </div>
                 </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-blue-900 text-white" id="impact">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-800/50">
               {stats.map((stat, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     viewport={{ once: true }}
                     className="p-2 md:p-4"
                  >
                     <div className="text-3xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200">{stat.number}</div>
                     <div className="text-blue-200 text-sm md:text-base font-medium">{stat.label}</div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase mb-3 text-sm md:text-base">Why Choose IssueX</h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 md:mb-6">Powerful Tools for Change</h3>
            <p className="text-base md:text-lg text-slate-600 px-4">Everything you need to report concerns to your local municipal corporation and see them resolved.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 md:p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 md:py-16 bg-slate-50 overflow-hidden" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
               <h2 className="text-blue-600 font-semibold tracking-wide uppercase mb-3 text-sm md:text-base">How It Works</h2>
               <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">From Problem to Solution</h3>
               
               <div className="space-y-8 md:space-y-12">
                  {steps.map((step, i) => (
                     <div key={i} className="flex gap-4 md:gap-6 group">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-200 group-hover:border-blue-600 bg-white flex items-center justify-center font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                           {step.number}
                        </div>
                        <div>
                           <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{step.title}</h4>
                           <p className="text-sm md:text-base text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative hidden md:block"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl transform rotate-3 opacity-20 blur-lg"></div>
               <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                  
                  {/* Mock App Interface - Indian Context */}
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                     <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     </div>
                     <div className="text-slate-400 text-sm font-medium">Ward No. 12 Dashboard</div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                           <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                           <div className="font-bold text-slate-800 text-sm">Water logging at MG Road</div>
                           <div className="text-xs text-slate-500">Reported 2 hours ago</div>
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-500 border border-slate-200">Pending</div>
                     </div>
                     
                     <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-blue-100 shadow-lg scale-105 transform">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                           <Activity size={20} />
                        </div>
                        <div className="flex-1">
                           <div className="font-bold text-slate-800 text-sm">Streetlight repair in Sector 4</div>
                           <div className="text-xs text-slate-500">Contractor Assigned</div>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-600 border border-blue-100">In Progress</div>
                     </div>

                     <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                           <CheckCircle size={20} />
                        </div>
                         <div className="flex-1">
                           <div className="font-bold text-slate-800 text-sm">Garbage pickup - Shivaji Park</div>
                           <div className="text-xs text-slate-500">Resolved yesterday</div>
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-500 border border-slate-200">Resolved</div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

       {/* Testimonials */}
       <section className="py-12 md:py-16 bg-white border-t border-slate-100" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
             <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8 md:mb-12">Trusted by Local Communities</h2>
             
             <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {[
                   {
                      text: "IssueX has completely transformed how our RWA handles complaints. The transparency with the Nagar Nigam is incredible.",
                      author: "Priya Sharma",
                      role: "RWA Secretary, Delhi"
                   },
                   {
                      text: "Finally, a platform that gives the common man a voice. Seeing the potholes get filled in my colony was so satisfying.",
                      author: "Rajesh Kumar",
                      role: "Resident, Mumbai"
                   },
                   {
                      text: "As a municipal officer, this tool helps us prioritize resources effectively and keep our ward clean and safe.",
                      author: "Vijay Patil",
                      role: "Ward Officer, Pune"
                   }
                ].map((item, i) => (
                   <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 md:p-8 bg-slate-50 rounded-3xl"
                   >
                      <div className="flex justify-center mb-6 text-blue-500">
                         {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
                      </div>
                      <p className="text-slate-700 italic mb-6">"{item.text}"</p>
                      <div>
                         <div className="font-bold text-slate-900">{item.author}</div>
                         <div className="text-sm text-slate-500">{item.role}</div>
                      </div>
                   </motion.div>
                ))}
             </div>
          </div>
       </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
         <div className="max-w-5xl mx-auto px-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl">
               {/* Decorative circles */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
               
               <h2 className="text-3xl lg:text-5xl font-bold mb-6 relative z-10">Ready to Improve Your City?</h2>
               <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto relative z-10">Join thousands of active citizens making their communities safer, cleaner, and better for everyone.</p>
               
               <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                  <Link 
                     to="/register" 
                     className="px-8 py-4 bg-white text-blue-700 rounded-full font-bold text-lg hover:shadow-lg hover:bg-blue-50 transition-all hover:-translate-y-1"
                  >
                     Get Started Now
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
               <Activity className="text-blue-500" size={24} />
               <span className="text-2xl font-bold text-white">IssueX</span>
            </div>
            <p className="max-w-xs mb-8">Empowering communities to build better cities through technology, transparency, and collaboration.</p>
            <div className="flex space-x-4">
               <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
               </a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.25 3.4 9.5 8.19 11.1.5.09.68-.22.68-.48v-1.7c-3.14.68-3.44-1.38-3.44-1.38-.45-1.15-1.11-1.46-1.11-1.46-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.72 2.65 1.22 3.3.93.1-.73.4-1.22.72-1.5-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.46-2.38 1.23-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.48 11.48 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.67.24 2.89.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.82 5.63-5.51 5.92.41.36.78 1.07.78 2.15v3.2c0 .27.18.57.68.48A10.03 10.03 0 0 0 22 12c0-5.52-4.48-10-10-10z"></path></svg>
               </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Showcase</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-blue-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2024 IssueX Civic Platform. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
               <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
               <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
