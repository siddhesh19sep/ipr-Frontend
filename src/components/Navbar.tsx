import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Shield, FileText, Settings as SettingsIcon, ArrowLeftRight } from 'lucide-react';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout, isAdminView, toggleAdminView } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleToggle = () => {
        toggleAdminView();
        // Redirect to appropriate landing dashboard after toggle
        if (isAdminView) {
            navigate('/dashboard'); // Switching to Creator
        } else {
            navigate('/admin-dashboard'); // Switching to Admin
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-indigo-600" />
                            <span className="font-bold text-xl tracking-tight text-gray-900">
                                IPR<span className="text-indigo-600">Chain</span>
                            </span>
                        </Link>

                        {isAuthenticated && user && (
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                {!isAdminView ? (
                                    <>
                                        {user.role === 'Admin' && (
                                            <Link
                                                to="/dashboard"
                                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                            >
                                                Creator Dashboard
                                            </Link>
                                        )}
                                        <Link
                                            to="/ips"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                        >
                                            IP Registry
                                        </Link>
                                        <Link
                                            to="/file-dispute"
                                            className="border-transparent text-gray-500 hover:text-rose-600 px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                        >
                                            File Dispute
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/admin-dashboard"
                                            className="border-transparent text-indigo-600 hover:border-indigo-300 hover:text-indigo-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-colors"
                                        >
                                            Admin Panel
                                        </Link>
                                        <Link
                                            to="/verification"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                        >
                                            Verification
                                        </Link>
                                        <Link
                                            to="/disputes"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                        >
                                            Dispute Queue
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center">
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-4">
                                {!isAdminView && (
                                    <Link
                                        to="/register-ip"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors gap-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Register IP
                                    </Link>
                                )}
                                <div className="text-sm font-medium text-gray-500 px-2 border-l border-gray-300">
                                    <span className="bg-indigo-50 text-indigo-700 py-1 px-2 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {user.role}
                                    </span>
                                </div>
                                {user.role === 'Admin' && (
                                    <button
                                        onClick={handleToggle}
                                        className="p-2 text-amber-600 hover:text-amber-700 transition-colors rounded-md hover:bg-amber-50"
                                        title={isAdminView ? "Switch to Creator View" : "Switch to Admin View"}
                                    >
                                        <ArrowLeftRight className="h-5 w-5" />
                                    </button>
                                )}
                                <Link
                                    to="/settings"
                                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50"
                                    title="Settings"
                                >
                                    <SettingsIcon className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-md font-bold shadow-sm"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
