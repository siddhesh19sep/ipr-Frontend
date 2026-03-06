import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Shield, User, Mail, Lock, Wallet } from 'lucide-react';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError('');
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed! Please install MetaMask to connect your Web3 wallet.');
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
            } else {
                setError('No wallet accounts found.');
            }
        } catch (err: any) {
            console.error('Wallet connection failed:', err);
            setError(err.message || 'Failed to connect wallet.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', { name, username, email, password, walletAddress });

            // Automatically log in using the returned JWT token
            if (response.data.token && response.data.user) {
                login(response.data.token, response.data.user);
            }

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-[80vh] py-12">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-6 py-8 text-center flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-full inline-block mb-4">
                        <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
                    <p className="text-indigo-200 mt-2 font-medium">Join the IPRChain Network</p>
                </div>

                <div className="px-8 py-10">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-3 bg-gray-50 border transition-colors"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-3 bg-gray-50 border transition-colors"
                                    placeholder="creator99"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-3 bg-gray-50 border transition-colors"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-3 bg-gray-50 border transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Web3 Wallet</label>

                            {walletAddress ? (
                                <div className="flex items-center justify-between pl-4 pr-2 py-3 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                                    <div className="flex items-center">
                                        <Wallet className="h-5 w-5 text-indigo-600 mr-3" />
                                        <span className="text-sm font-medium text-indigo-900 truncate max-w-[200px] sm:max-w-xs">{walletAddress}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setWalletAddress('')}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded shadow-sm border border-indigo-100 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={connectWallet}
                                    disabled={isConnecting}
                                    className={`w-full flex justify-center items-center py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 focus:outline-none transition-all ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {isConnecting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Connecting to MetaMask...
                                        </span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M32.85 1.86L19.22 11.83L27.24 16.51L32.85 1.86Z" fill="#E17726" />
                                                <path d="M1.74 1.86L7.35 16.51L15.37 11.83L1.74 1.86Z" fill="#E27625" />
                                                <path d="M26.23 23.32L21.36 29.87L28.1 30.73L30.93 25.13L26.23 23.32Z" fill="#E27625" />
                                                <path d="M3.66 25.13L6.49 30.73L13.23 29.87L8.36 23.32L3.66 25.13Z" fill="#E27625" />
                                                <path d="M11.23 18.43L14.74 25.32L17.29 27.65L19.85 25.32L23.36 18.43L17.29 14.88L11.23 18.43Z" fill="#E27625" />
                                                <path d="M11.23 18.43L17.29 14.88L15.37 11.83L7.35 16.51L11.23 18.43Z" fill="#D5BFB2" />
                                                <path d="M19.22 11.83L17.29 14.88L23.36 18.43L27.24 16.51L19.22 11.83Z" fill="#D5BFB2" />
                                                <path d="M15.37 11.83L17.29 14.88L19.22 11.83L17.29 6.25L15.37 11.83Z" fill="#233447" />
                                                <path d="M11.23 18.43L8.36 23.32L13.23 29.87L14.74 25.32L11.23 18.43Z" fill="#CC6228" />
                                                <path d="M26.23 23.32L23.36 18.43L19.85 25.32L21.36 29.87L26.23 23.32Z" fill="#CC6228" />
                                                <path d="M27.24 16.51L23.36 18.43L26.23 23.32L30.93 25.13L32.96 11.66L27.24 16.51Z" fill="#F6851B" />
                                                <path d="M7.35 16.51L1.63 11.66L3.66 25.13L8.36 23.32L11.23 18.43L7.35 16.51Z" fill="#F6851B" />
                                                <path d="M13.23 29.87L17.29 32.7L21.36 29.87L19.85 25.32L17.29 27.65L14.74 25.32L13.23 29.87Z" fill="#F6851B" />
                                            </svg>
                                            Connect MetaMask Address
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all mt-6 ${isLoading ? 'opacity-75 cursor-not-allowed' : 'transform hover:-translate-y-0.5'}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Register'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
