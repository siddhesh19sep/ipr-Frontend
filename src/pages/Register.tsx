import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Web3Context } from '../context/Web3Context';
import { Shield, User, Mail, Lock, Wallet, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [receivedOtp, setReceivedOtp] = useState('');
    const [deliveryError, setDeliveryError] = useState('');
    const [deliverySuggestion, setDeliverySuggestion] = useState('');

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { account, connectWallet: connectWeb3, isConnecting: isWeb3Connecting } = useContext(Web3Context);

    // Timer logic for resend cooldown
    React.useEffect(() => {
        let timer: any;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    // Sync local wallet address with Web3Context
    React.useEffect(() => {
        if (account) {
            setWalletAddress(account);
        }
    }, [account]);

    const connectWallet = async () => {
        await connectWeb3();
    };

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSendingOtp(true);
        setError('');

        try {
            const response = await api.post('/auth/send-otp', { email, username });
            setSuccessMessage(response.data.message || 'Verification code sent!');
            setShowOtpInput(true);
            setResendTimer(30); 
            
            if (response.data.otp) {
                setOtp(response.data.otp);
                setReceivedOtp(response.data.otp);
            }

            if (response.data.isMock) {
                setDeliveryError(response.data.reason || 'Infrastructure Restriction');
                setDeliverySuggestion(response.data.suggestion || 'Please check your SMTP provider settings or use a verified email.');
            } else {
                setDeliveryError('');
                setDeliverySuggestion('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setSuccessMessage('Resending code...');
        await handleSendOtp();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', { name, username, email, password, walletAddress, otp });
            if (response.data.token && response.data.user) {
                login(response.data.token, response.data.user);
            }
            navigate('/ips');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
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
                        src="https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                        alt="Blockchain Network" 
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-emerald-900/30"></div>
                </div>
                
                <div className="relative z-10 p-12">
                    <Link to="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
                        <div className="bg-white p-2.5 rounded-2xl shadow-lg shadow-white/10">
                            <Shield className="h-8 w-8 text-emerald-600" />
                        </div>
                        <span className="font-extrabold text-3xl tracking-tight text-white drop-shadow-md">
                            IPR<span className="text-emerald-400">Chain</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 p-12 pb-24">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="inline-block py-1.5 px-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm shadow-sm">
                            Join the Network
                        </span>
                        <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                            Empower your creations with Web3 technology.
                        </h1>
                        <p className="text-lg text-slate-300 max-w-md leading-relaxed font-medium">
                            Create a free account to instantly patent, trademark, or secure copyright claims using verified Polygon Amoy smart contracts.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
                <div className="w-full max-w-md mx-auto py-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="text-center lg:text-left mb-8">
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="bg-emerald-50 p-4 rounded-3xl shadow-inner">
                                    <Shield className="h-12 w-12 text-emerald-600" />
                                </div>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                                {showOtpInput ? 'Verify Email' : 'Create Account'}
                            </h2>
                            <p className="text-slate-500 text-base sm:text-lg font-medium">
                                {showOtpInput ? 'Enter the 6-digit code sent to your email.' : 'Register to interact with the blockchain.'}
                            </p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl mb-6 flex items-center gap-3 shadow-sm" role="alert">
                                <div className="p-1 bg-rose-100 rounded-full shrink-0"><Lock size={14} className="text-rose-600"/></div>
                                <p className="font-bold text-sm">{error}</p>
                            </motion.div>
                        )}

                        {!showOtpInput ? (
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                                <User className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                            </div>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 block w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white text-sm px-4 py-3 transition-all text-slate-900 font-medium outline-none" placeholder="John Doe" required />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Username</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                                <User className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                            </div>
                                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 block w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white text-sm px-4 py-3 transition-all text-slate-900 font-medium outline-none" placeholder="creator99" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 block w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white text-md px-4 py-3.5 transition-all text-slate-900 font-medium outline-none" placeholder="you@example.com" required />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        </div>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            className="pl-12 pr-12 block w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white text-md px-4 py-3.5 transition-all text-slate-900 font-medium outline-none" 
                                            placeholder="••••••••" 
                                            required 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Web3 Wallet Integration (Optional)</label>
                                    {walletAddress ? (
                                        <div className="flex items-center justify-between pl-4 pr-2 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
                                            <div className="flex items-center">
                                                <Wallet className="h-5 w-5 text-emerald-600 mr-3" />
                                                <span className="text-sm font-bold text-emerald-900 truncate max-w-[200px] sm:max-w-[250px]">{walletAddress}</span>
                                            </div>
                                            <button type="button" onClick={() => setWalletAddress('')} className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl shadow-sm border border-emerald-200 transition-all">
                                                Clear
                                            </button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={connectWallet} disabled={isWeb3Connecting} className={`w-full flex justify-center items-center py-4 px-4 border-2 border-dashed border-slate-300 rounded-2xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 focus:outline-none transition-all ${isWeb3Connecting ? 'opacity-75 cursor-not-allowed' : ''}`}>
                                            {isWeb3Connecting ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Verifying MetaMask...
                                                </span>
                                            ) : (
                                                <>
                                                    <Wallet className="w-5 h-5 mr-3" /> Connect MetaMask Address
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <button type="submit" disabled={isSendingOtp} className={`w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all mt-4 ${isSendingOtp ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-emerald-500/30'}`}>
                                    {isSendingOtp ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sending Verification Code...
                                        </span>
                                    ) : (
                                        <>Send Verification Code</>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl mb-6 text-center">
                                    <p className="text-sm font-medium text-emerald-800">
                                        {successMessage || `We've sent a 6-digit verification code to ${email}.`}
                                    </p>
                                    {receivedOtp && (
                                        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left">
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
                                        className="block w-full text-center tracking-[0.5em] font-mono text-2xl bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white px-4 py-4 transition-all text-slate-900 font-bold outline-none" 
                                        placeholder="000000" 
                                        maxLength={6}
                                        required 
                                    />
                                </div>

                                <button type="submit" disabled={isLoading || otp.length !== 6} className={`w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all mt-6 ${isLoading || otp.length !== 6 ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-indigo-500/30'}`}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Verifying & Registering...
                                        </span>
                                    ) : (
                                        <>Submit & Create Account</>
                                    )}
                                </button>
                                
                                <div className="flex justify-between items-center w-full mt-4">
                                    <button type="button" onClick={() => setShowOtpInput(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                                        &larr; Back to details
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleResendOtp}
                                        disabled={isSendingOtp || resendTimer > 0}
                                        className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-50 disabled:text-slate-400"
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
                            Already protecting your assets?{' '}
                            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-all">
                                Sign In Here
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default Register;
