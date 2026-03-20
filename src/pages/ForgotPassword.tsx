import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                    {/* Decorative Gradient */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    {!isSubmitted ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                            <p className="text-slate-400 mb-8 font-medium">
                                No worries! Enter your email and we'll send you a secure link to reset it.
                            </p>

                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-12 block w-full bg-slate-800/50 border border-slate-700 rounded-2xl text-white px-4 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center gap-3 py-4 px-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                >
                                    {isLoading ? 'Processing...' : (
                                        <>
                                            <Send size={18} /> Send Recovery Link
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
                            <h2 className="text-2xl font-bold text-white mb-3">Email Sent!</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                We've dispatched a recovery link to <span className="text-white font-bold">{email}</span>. 
                                Please check your inbox (and spam folder) to reset your password.
                            </p>
                            <Link 
                                to="/login" 
                                className="inline-flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </Link>
                        </div>
                    )}

                    {!isSubmitted && (
                        <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center">
                            <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                                <ArrowLeft size={16}/> Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
