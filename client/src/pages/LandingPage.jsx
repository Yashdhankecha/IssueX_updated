import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Shield, 
  Zap, 
  CheckCircle, 
  Activity,
  Menu,
  X,
  Smartphone,
  Globe,
  Bell,
  Cpu,
  BarChart3,
  Layers,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* --- Navbar --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50"></div>
                      <div className="relative bg-[#0F172A] rounded-xl w-full h-full flex items-center justify-center border border-white/10">
                          <Zap size={20} className="text-blue-400" fill="currentColor" />
                      </div>
                  </div>
                  <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">IssueX</span>
              </div>

              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                  {['Features', 'Live Map', 'Impact', 'Community'].map((item) => (
                      <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors relative group">
                          {item}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
                      </a>
                  ))}
              </div>

              <div className="flex items-center gap-4">
                  {user ? (
                      <Link to="/dashboard" className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-all hover:scale-105">
                          Dashboard
                      </Link>
                  ) : (
                      <div className="flex items-center gap-4">
                          <Link to="/login" className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors">Log In</Link>
                          <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full hover:shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-105 border border-white/10">
                              Get Started
                          </Link>
                      </div>
                  )}
                  <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white">
                      {menuOpen ? <X /> : <Menu />}
                  </button>
              </div>
          </div>
      </nav>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
          {menuOpen && (
              <motion.div
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="fixed inset-0 z-40 bg-[#030712] pt-24 px-6 flex flex-col gap-6"
              >
                  {['Features', 'Live Map', 'Impact', 'Community'].map((item) => (
                      <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMenuOpen(false)} className="text-2xl font-bold text-slate-300 hover:text-white">
                          {item}
                      </a>
                  ))}
                  <div className="h-px bg-white/10 my-4"></div>
                  <Link to="/login" className="text-xl font-bold text-slate-300">Log In</Link>
                  <Link to="/register" className="text-xl font-bold text-blue-400">Create Account</Link>
              </motion.div>
          )}
      </AnimatePresence>

      <section className="relative pt-32 pb-4 lg:pt-40 lg:pb-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center lg:text-left">
                  
                  

                  <motion.h1 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="text-5xl lg:text-7xl font-bold tracking-tight mt-4 lg:mt-0 mb-2 lg:mb-6 leading-[1.1]"
                  >
                      <span className="text-white">Future of</span> <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">Civic Intelligence.</span>
                  </motion.h1>

                  <motion.p 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="text-lg lg:text-xl text-slate-400 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  >
                      Report infrastructure issues with AI-powered precision. Connect directly with municipal grids. Watch your city upgrade in real-time.
                  </motion.p>

                  <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                  >
                      <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                          Start Reporting <Zap size={20} fill="currentColor" className="text-yellow-500" />
                      </Link>
                      <Link to="/map" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                          <Globe size={20} className="text-blue-400" /> Live Map
                      </Link>
                  </motion.div>

                  <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                      className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-white/5 pt-8"
                  >
                      {[
                          { label: 'Active Reports', val: '12K+' },
                          { label: 'Avg Resolution', val: '24h' },
                          { label: 'Verified Zones', val: '50+' }
                      ].map((stat, i) => (
                          <div key={i}>
                              <div className="text-2xl font-bold text-white">{stat.val}</div>
                              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
                          </div>
                      ))}
                  </motion.div>
              </motion.div>

              {/* --- Hero Visual (Holographic Card) --- */}
              <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotateY: 30 }} 
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }} 
                  transition={{ duration: 1, type: "spring" }}
                  className="relative hidden lg:block perspective-1000"
              >
                   <div className="relative w-full aspect-[4/5] max-w-md mx-auto bg-slate-900 rounded-[2rem] border border-white/10 p-4 shadow-2xl transform hover:rotate-y-6 transition-transform duration-500">
                       
                       {/* Card Content - Abstract Map */}
                       <div className="w-full h-full bg-[#0B1221] rounded-2xl overflow-hidden relative z-10 shadow-inner">
                           {/* Grid Overlay */}
                           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                           
                           {/* Map Background */}
                           <div className="absolute inset-0 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/12/2299/1480.png')] bg-cover opacity-80 mix-blend-luminosity"></div>
                           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent"></div>
                           
                           {/* Radar Scan Effect */}
                           <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute w-[80%] h-[80%] border border-blue-500/20 rounded-full"></div>
                                <div className="absolute w-[60%] h-[60%] border border-blue-500/20 rounded-full"></div>
                                <div className="absolute w-[40%] h-[40%] border border-blue-500/20 rounded-full"></div>
                                
                                {/* Scanning Line */}
                                <div className="absolute top-1/2 left-1/2 w-[45%] h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-400 origin-left animate-spin-slow"></div>
                                
                                {/* Blips */}
                                <div className="absolute top-[30%] left-[60%] w-2 h-2 bg-red-500 rounded-full animate-ping-slow"></div>
                                <div className="absolute bottom-[40%] right-[30%] w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                           </div>

                           {/* Bottom Info */}
                           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B1221] via-[#0B1221]/90 to-transparent">
                               <div className="flex items-center justify-between mb-2">
                                   <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                       System Online
                                   </span>
                                   <div className="flex gap-1">
                                       <span className="w-1 h-3 bg-blue-500 rounded-full opacity-50"></span>
                                       <span className="w-1 h-3 bg-blue-500 rounded-full opacity-75"></span>
                                       <span className="w-1 h-3 bg-blue-500 rounded-full opacity-100"></span>
                                   </div>
                               </div>
                               <h3 className="text-2xl font-bold text-white tracking-tight">IssueX Sentinel AI</h3>
                           </div>
                       </div>

                       {/* Floating UI Elements (Z-Index Corrected) */}
                       <div className="absolute -right-12 top-20 bg-[#0F172A] p-4 rounded-xl border border-green-500/30 shadow-2xl flex items-center gap-3 animate-float delay-100 z-50">
                           <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                               <CheckCircle size={20} className="text-green-400" />
                           </div>
                           <div className="whitespace-nowrap">
                               <div className="text-xs text-slate-400 font-medium">Status Update</div>
                               <div className="text-sm font-bold text-white">Fixed • Sector 4</div>
                           </div>
                       </div>

                       <div className="absolute -left-12 bottom-32 bg-[#0F172A] p-4 rounded-xl border border-blue-500/30 shadow-2xl flex items-center gap-3 animate-float-reverse z-50">
                           <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                               <Activity size={20} className="text-blue-400" />
                           </div>
                           <div className="whitespace-nowrap">
                               <div className="text-xs text-slate-400 font-medium">Live Traffic</div>
                               <div className="text-sm font-bold text-white text-left">High Volume</div>
                           </div>
                       </div>

                   </div>
              </motion.div>
          </div>
      </section>

      {/* --- Features Grid (Glassmorphism) --- */}
      <section id="features" className="pt-8 pb-16 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  <span className="text-blue-400 font-bold uppercase tracking-widest text-sm">Platform Capabilities</span>
                  <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6"><span className="text-white">Next-Gen</span> Features</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">Built for speed, accuracy, and transparency. The first civic platform that feels like it belongs in 2030.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                  {[
                      { icon: MapPin, title: "Precision Mapping", desc: "Sub-meter accuracy for every reported issue using GPS & triangulated data.", color: "text-blue-400", bg: "bg-blue-500/10" },
                      { icon: Shield, title: "AI Verification", desc: "Uploaded photos are analyzed instantly to reject spam and duplicates.", color: "text-purple-400", bg: "bg-purple-500/10" },
                      { icon: Layers, title: "Dept. Routing", desc: "Automatic assignment to PWD, Sanitation, or Electrical boards based on issue type.", color: "text-indigo-400", bg: "bg-indigo-500/10" },
                      { icon: BarChart3, title: "Live Analytics", desc: "Real-time dashboards for municipal officers to track efficiency.", color: "text-green-400", bg: "bg-green-500/10" },
                      { icon: Search, title: "Transparency", desc: "Public logs of every action taken. Nothing is hidden behind red tape.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
                      { icon: Smartphone, title: "Omni-Channel", desc: "Report via App, Web, or WhatsApp Bot (Coming Soon).", color: "text-pink-400", bg: "bg-pink-500/10" }
                  ].map((f, i) => (
                      <motion.div 
                          key={i}
                          whileHover={{ y: -5 }}
                          className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group"
                      >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.bg}`}>
                              <f.icon size={28} className={f.color} />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                          <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Interactive Workflow (Dark) --- */}
      <section id="how-it-works" className="py-24 bg-[#0F172A]/50 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="order-2 lg:order-1 relative">
                       <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                       <div className="relative bg-[#030712] border border-white/10 rounded-2xl p-8 shadow-2xl">
                           {/* Step 1 Msg */}
                           <div className="flex gap-4 mb-6">
                               <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0"></div>
                               <div className="bg-blue-600 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed max-w-sm">
                                   I found a broken streetlight on Main St. It's pitch black here.
                               </div>
                           </div>
                           {/* Step 2 AI Response */}
                           <div className="flex gap-4 flex-row-reverse mb-6">
                               <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                                   <Zap size={20} className="text-white" />
                               </div>
                               <div className="bg-slate-800 border border-white/10 rounded-2xl rounded-tr-none p-4 text-sm leading-relaxed max-w-sm">
                                   <span className="text-blue-400 font-bold block mb-1">IssueX AI</span>
                                   Confirmed. Location tagged: <span className="text-white font-mono">28.6139° N, 77.2090° E</span>. Ticket #9920 created for Electricity Board.
                               </div>
                           </div>
                           {/* Step 3 Success */}
                           <div className="flex justify-center mt-8">
                               <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                   <CheckCircle size={14} /> Assigned to Field Worker
                               </div>
                           </div>
                       </div>
                  </div>
                  
                  <div className="order-1 lg:order-2">
                      <h2 className="text-4xl font-bold mb-8">Conversational.<br />Automated. <span className="text-blue-400">Instant.</span></h2>
                      <div className="space-y-8">
                          {[
                              { title: '1. Report', text: 'Snap a picture or describe the issue. That’s it.' },
                              { title: '2. Auto-Triaging', text: 'Our AI identifies the problem type and routes it to the exact department responsible.' },
                              { title: '3. Resolution', text: 'Workers get a dedicated app notification. You get updates at every step.' },
                          ].map((s, i) => (
                              <div key={i} className="pl-6 border-l-2 border-white/10 relative">
                                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                  <h4 className="text-xl font-bold text-white mb-2">{s.title}</h4>
                                  <p className="text-slate-400">{s.text}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- Big CTA (Aurora) --- */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-5xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-8 tracking-tighter">
                  JOIN THE <br /> REVOLUTION
              </h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                  Don't just live in your city. Upgrade it. Be part of the fastest growing civic intelligence network.
              </p>
              <Link to="/register" className="inline-flex h-16 px-12 items-center justify-center rounded-full bg-white text-black text-xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]">
                  Launch App
              </Link>
          </div>
      </section>

      {/* --- Footer (Minimal Dark) --- */}
      <footer className="border-t border-white/5 bg-[#02040a] py-12 text-center text-slate-600 text-sm">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center"><Zap size={14} className="text-slate-400" fill="currentColor" /></div>
                  <span className="font-bold text-slate-400">IssueX Systems</span>
              </div>
              <div className="flex gap-6">
                  <a href="#" className="hover:text-white transition-colors">Documentation</a>
                  <a href="#" className="hover:text-white transition-colors">API Status</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
              </div>
              <div>© 2026 IssueX. All systems nominal.</div>
          </div>
      </footer>

    </div>
  );
};

export default LandingPage;
