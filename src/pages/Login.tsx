import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Shield, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [receivedOtp, setReceivedOtp] = useState('');
    const [deliveryError, setDeliveryError] = useState('');
    const [deliverySuggestion, setDeliverySuggestion] = useState('');

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            setResendMessage('');
            const response = await api.post('/auth/login', { username, password });
            login(response.data.token, response.data.user);
            
            // Role-based redirection logic
            if (response.data.user.role === 'Admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/ips');
            }
        } catch (err: any) {
            if (err.response?.data?.requiresVerification) {
                setUnverifiedEmail(err.response.data.email);
                setResendMessage(err.response.data.message || 'Verification required. A code has been sent.');
                setShowOtpInput(true);
                setError('');
                
                // DEMO MODE: Auto-fill OTP if returned by backend
                if (err.response.data.otp) {
                    setOtp(err.response.data.otp);
                    setReceivedOtp(err.response.data.otp);
                }

                if (err.response.data.isMock) {
                    setDeliveryError(err.response.data.reason || 'Infrastructure Restriction');
                    setDeliverySuggestion(err.response.data.suggestion || 'Please check your SMTP settings.');
                } else {
                    setDeliveryError('');
                    setDeliverySuggestion('');
                }
            } else {
                setError(err.response?.data?.message || 'Failed to login. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify-login', { email: unverifiedEmail, otp });
            login(response.data.token, response.data.user);
            
            if (response.data.user.role === 'Admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/ips');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError('');
        setResendMessage('');
        try {
            const response = await api.post('/auth/send-otp', { email: unverifiedEmail, isLogin: true });
            setResendMessage(response.data.message || 'A new verification code has been sent to your email.');
            
            // DEMO MODE: Auto-fill OTP if returned by backend
            if (response.data.otp) {
                setOtp(response.data.otp);
                setReceivedOtp(response.data.otp);
            }

            if (response.data.isMock) {
                setDeliveryError(response.data.reason || 'Infrastructure Restriction');
                setDeliverySuggestion(response.data.suggestion || 'Please check your SMTP settings.');
            } else {
                setDeliveryError('');
                setDeliverySuggestion('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex bg-white font-sans">
            {/* Left Side (Image/Theme) */}
            <div className="hidden lg:flex w-[45%] bg-slate-900 relative overflow-hidden flex-col justify-between">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1639762681485-074b7f4ec651?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                        alt="Blockchain" 
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-indigo-900/30"></div>
                </div>
                
                <div className="relative z-10 p-12">
                    <Link to="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
                        <div className="bg-white p-2.5 rounded-2xl shadow-lg shadow-white/10">
                            <Shield className="h-8 w-8 text-indigo-600" />
                        </div>
                        <span className="font-extrabold text-3xl tracking-tight text-white drop-shadow-md">
                            IPR<span className="text-indigo-400">Chain</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 p-12 pb-24">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="inline-block py-1.5 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm shadow-sm">
                            Authentication Gateway
                        </span>
                        <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                            Secure your digital legacy on the blockchain.
                        </h1>
                        <p className="text-lg text-slate-300 max-w-md leading-relaxed font-medium">
                            Welcome back. Access your immutable intellectual property portfolio and track your global verification status in real-time.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white overflow-y-auto">
                <div className="w-full max-w-md mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="text-center lg:text-left mb-10">
                            <div className="lg:hidden flex justify-center mb-8">
                                <div className="bg-indigo-50 p-4 rounded-3xl shadow-inner">
                                    <Shield className="h-12 w-12 text-indigo-600" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                                {showOtpInput ? 'Verify Email' : 'Welcome Back'}
                            </h2>
                            <p className="text-slate-500 text-lg font-medium">
                                {showOtpInput ? 'Please enter the 6-digit code sent to your email.' : 'Please enter your details to sign in.'}
                            </p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl mb-8 flex items-center gap-3 shadow-sm" role="alert">
                                <div className="p-1 bg-rose-100 rounded-full shrink-0"><Lock size={14} className="text-rose-600"/></div>
                                <p className="font-bold text-sm">{error}</p>
                            </motion.div>
                        )}
                        
                        {resendMessage && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl mb-8 flex items-center gap-3 shadow-sm" role="alert">
                                <p className="font-bold text-sm">{resendMessage}</p>
                            </motion.div>
                        )}

                        {!showOtpInput ? (
                            <>
                                <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Username or Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-12 block w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white text-base px-4 py-3.5 transition-all text-slate-900 font-medium outline-none"
                                        placeholder="creator99 or you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-bold text-slate-700">Password</label>
                                    <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Forgot password?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 pr-12 block w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white text-base px-4 py-3.5 transition-all text-slate-900 font-medium outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-indigo-500/30 shadow-indigo-500/20'}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating Node...
                                    </span>
                                ) : (
                                    <>
                                        Log In
                                    </>
                                )}
                            </button>
                                </form>

                                <div className="mt-10 relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest text-xs">New to IPRChain?</span>
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <Link 
                                        to="/register" 
                                        className="inline-flex justify-center items-center w-full py-4 px-4 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
                                    >
                                        Create an Account
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleVerifyLogin} className="space-y-5">
                                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl mb-6 text-center">
                                    <p className="text-sm font-medium text-indigo-800">
                                        {resendMessage || `We've sent a 6-digit verification code to ${unverifiedEmail}.`}
                                    </p>
                                    {receivedOtp && (
                                        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left font-sans">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${deliveryError ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    {deliveryError ? 'Delivery Issue Detected' : 'Email Sent Successfully'}
                                                </span>
                                            </div>
                                            
                                            {deliveryError && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-bold text-slate-700 mb-1">Reason: <span className="text-amber-600 uppercase">{deliveryError}</span></p>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{deliverySuggestion}</p>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">Backup Verification Code:</span>
                                                <span className="text-lg font-mono font-black text-indigo-600 bg-white px-3 py-1 rounded-lg border border-indigo-100 shadow-sm">{receivedOtp}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-center">Enter Verification Code</label>
                                    <input 
                                        type="text" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                        className="block w-full text-center tracking-[0.5em] font-mono text-2xl bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white px-4 py-4 transition-all text-slate-900 font-bold outline-none" 
                                        placeholder="000000" 
                                        maxLength={6}
                                        required 
                                    />
                                </div>

                                <button type="submit" disabled={isLoading || otp.length !== 6} className={`w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all mt-6 ${isLoading || otp.length !== 6 ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-indigo-500/30'}`}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Verifying...
                                        </span>
                                    ) : (
                                        <>Log In to IPRChain</>
                                    )}
                                </button>
                                
                                <div className="flex justify-between items-center w-full mt-4">
                                    <button type="button" onClick={() => setShowOtpInput(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                                        &larr; Use a different account
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default Login;
