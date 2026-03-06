import { Link } from 'react-router-dom';
import { Shield, Lock, FileCheck, Zap, ArrowRight, CheckCircle2, Globe, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Shield size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">IPR Shield</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
          <a href="#security" className="hover:text-indigo-600 transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login/user" className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors">Login</Link>
          <Link to="/login/admin" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Admin Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} />
              <span>Next-Gen IP Protection</span>
            </div>
            <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              Secure Your Intellectual Property with <span className="text-indigo-600">Blockchain</span> Protection
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
              Immutable timestamping, verified ownership authentication, and secure smart contract licensing. The world's most trusted platform for IPR management.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login/user" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 group">
                Login as Creator/User
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login/admin" className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all">
                Login as Admin
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                    className="w-10 h-10 rounded-full border-2 border-white object-cover" 
                    alt="User"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Joined by <span className="text-slate-900 font-bold">2,500+</span> creators across India
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />
            
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-4 overflow-hidden">
              <div className="bg-slate-50 rounded-[2rem] p-8 aspect-square flex items-center justify-center relative">
                {/* Visual Representation of Blockchain/IP */}
                <div className="relative z-10">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-48 h-48 bg-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center text-white relative"
                  >
                    <Shield size={80} strokeWidth={1.5} />
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Lock size={24} />
                    </div>
                  </motion.div>
                  
                  {/* Floating Elements */}
                  <motion.div 
                    animate={{ x: [0, 10, 0], y: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -left-12 top-0 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      <Database size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blockchain Hash</p>
                      <p className="text-xs font-mono font-bold text-slate-900">0x7f8e...a1b2</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ x: [0, -10, 0], y: [0, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-16 bottom-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                      <p className="text-xs font-bold text-slate-900">Verified Ownership</p>
                    </div>
                  </motion.div>
                </div>

                {/* Background Grid/Nodes */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Comprehensive IPR Management</h2>
            <p className="text-slate-600">Everything you need to protect, manage, and monetize your intellectual assets in one secure platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Immutable Timestamping', 
                desc: 'Every registration is recorded on the blockchain with a permanent, tamper-proof timestamp.',
                icon: Zap,
                color: 'bg-indigo-100 text-indigo-600'
              },
              { 
                title: 'Smart Contract Licensing', 
                desc: 'Automate licensing agreements and ensure compliance with self-executing smart contracts.',
                icon: Lock,
                color: 'bg-purple-100 text-purple-600'
              },
              { 
                title: 'Royalty Tracking', 
                desc: 'Real-time tracking of royalty payments in Indian Rupees (₹) with transparent reporting.',
                icon: Globe,
                color: 'bg-emerald-100 text-emerald-600'
              },
              { 
                title: 'Dispute Resolution', 
                desc: 'Structured legal framework for resolving IP disputes with blockchain-backed evidence.',
                icon: Shield,
                color: 'bg-amber-100 text-amber-600'
              },
              { 
                title: 'Ownership Verification', 
                desc: 'Instant verification of IP ownership for third parties through public blockchain records.',
                icon: FileCheck,
                color: 'bg-blue-100 text-blue-600'
              },
              { 
                title: 'Global Compliance', 
                desc: 'Adheres to international IPR standards while optimized for Indian legal requirements.',
                icon: CheckCircle2,
                color: 'bg-rose-100 text-rose-600'
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Shield size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">IPR Shield</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 IPR Shield. Securely protecting Indian innovation.</p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
