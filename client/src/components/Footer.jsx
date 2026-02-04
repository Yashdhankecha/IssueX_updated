import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Twitter, 
  Linkedin,
  Instagram,
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030712] border-t border-white/10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-[#0F172A] rounded-xl w-full h-full flex items-center justify-center border border-white/10">
                  <Zap size={20} className="text-blue-400" fill="currentColor" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">IssueX</h3>
                <p className="text-slate-500 text-xs">Civic Intelligence</p>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Join thousands of active citizens working together to improve their communities.
            </p>

            {/* Social */}
            <div className="flex space-x-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Map View', href: '/map' },
                { name: 'Report Issue', href: '/report' },
                { name: 'Dashboard', href: '/dashboard' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Help Center', href: '/help' },
                { name: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
            <div className="space-y-3">
              {[
                { icon: Mail, text: 'developerstripod@gmail.com' },
                { icon: Phone, text: '+91 8799038003' },
                { icon: MapPin, text: 'Gujarat, India' },
                { icon: Globe, text: 'www.issuex.com' },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                    <item.icon size={14} className="text-blue-400" />
                  </div>
                  <span className="text-slate-400 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">
            © {currentYear} IssueX. All rights reserved. Made with ❤️ by Tripod
          </p>
          
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform border border-white/10"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;