import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Phone, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage({ onLogin }: { onLogin: (role: 'Admin' | 'User') => void }) {
  const { role } = useParams<{ role: 'admin' | 'user' }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const isAdmin = role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin(isAdmin ? 'Admin' : 'User');
      navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Home</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 p-10"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isAdmin ? 'Admin Portal' : 'User Login'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isAdmin 
                ? 'Access the central management system' 
                : 'Manage your intellectual property assets'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                {isAdmin ? 'Email Address' : 'Mobile Number'}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  {isAdmin ? <Mail size={18} /> : <Phone size={18} />}
                </div>
                <input 
                  required
                  type={isAdmin ? "email" : "text"}
                  placeholder={isAdmin ? "admin@iprshield.com" : "+91 9876543210"}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-[10px] font-bold text-indigo-600 hover:underline">Forgot Password?</a>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isAdmin 
                ? 'Restricted access for authorized personnel only.' 
                : "Don't have an account? "}
              {!isAdmin && <a href="#" className="text-indigo-600 font-bold hover:underline">Register Now</a>}
            </p>
          </div>
        </motion.div>

        {/* Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Blockchain Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
