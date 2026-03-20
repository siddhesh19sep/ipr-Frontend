import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-10">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-2xl shadow-xl shadow-indigo-500/20">
                            <Shield className="h-8 w-8 text-indigo-600" />
                        </div>
                        <span className="font-extrabold text-3xl tracking-tight text-white">
                            IPR<span className="text-indigo-400">Chain</span>
                        </span>
                    </Link>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>

                    {!isSuccess ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
                            <p className="text-slate-400 mb-8 font-medium">
                                Secure your account with a strong, unique password.
                            </p>

                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-12 pr-12 block w-full bg-slate-800/50 border border-slate-700 rounded-2xl text-white px-4 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="pl-12 block w-full bg-slate-800/50 border border-slate-700 rounded-2xl text-white px-4 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center gap-3 py-4 px-4 rounded-2xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                >
                                    {isLoading ? 'Updating...' : (
                                        <>
                                            <RefreshCw size={18} /> Update Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-6">
                                <div className="bg-emerald-500/10 p-4 rounded-full">
                                    <CheckCircle className="h-12 w-12 text-emerald-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Password Updated!</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                                Your account security has been refreshed. You can now use your new password to sign in to the platform.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 px-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1"
                            >
                                Continue to Login
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
