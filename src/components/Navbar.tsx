import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Shield, Settings as SettingsIcon, ArrowLeftRight, Bell, Check, Trash2, Info } from 'lucide-react';
import * as api from '../services/api';
import GlobalSearch from './GlobalSearch';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout, isAdminView, toggleAdminView } = useContext(AuthContext);
    const navigate = useNavigate();
    const [alerts, setAlerts] = React.useState<any[]>([]);
    const [showAlerts, setShowAlerts] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        if (isAuthenticated) {
            const fetchAlerts = async () => {
                try {
                    const res = await api.getMyAlerts();
                    setAlerts(res.data);
                    setUnreadCount(res.data.filter((a: any) => !a.isRead).length);
                } catch (e) {
                    console.error("Failed to fetch alerts", e);
                }
            };
            fetchAlerts();
            const interval = setInterval(fetchAlerts, 60000); // Polling every minute
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.markAlertAsRead(id);
            setAlerts(alerts.map(a => a._id === id ? { ...a, isRead: true } : a));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

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
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 z-20 relative sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group relative">
                            <Shield className="h-8 w-8 text-indigo-600 group-hover:rotate-12 transition-transform" />
                            <span className="font-bold text-xl tracking-tight text-gray-900">
                                IPR<span className="text-indigo-600">Chain</span>
                            </span>
                            
                            {/* Diagnostic Badge Hover */}
                            <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-[10px] w-64 z-[100] font-mono leading-tight">
                                <p className="text-emerald-400 mb-1 font-bold">● SYSTEM OPERATIONAL</p>
                                <p className="text-slate-400 mb-2 border-b border-slate-800 pb-1">v1.2.5 Final Production Audit</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">API:</span>
                                        <span className="text-indigo-300 truncate ml-2">1-2llk.onrender.com</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">USER:</span>
                                        <span className="text-white">{user?.name || 'Guest'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">ROLE:</span>
                                        <span className="text-indigo-300 uppercase">{user?.role || 'Guest'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">STORAGE:</span>
                                        <span className="text-emerald-400">50MB Active</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="mt-3 w-full bg-slate-800 hover:bg-slate-700 py-1.5 rounded font-bold text-indigo-400 border border-slate-700 transition-colors"
                                >
                                    Force Global Sync
                                </button>
                            </div>
                        </Link>
                        
                        {/* Global Search Bar */}
                        {isAuthenticated && <GlobalSearch />}
                    </div>

                    <div className="flex items-center">
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-2 lg:border-l border-gray-300">
                                    <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                        {user.role === 'User' ? 'User' : user.role}
                                    </span>
                                    {user.role === 'Admin' && (
                                        <span className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm animate-in fade-in slide-in-from-right-2 duration-300 ${
                                            isAdminView 
                                            ? 'bg-rose-500 text-white shadow-rose-200' 
                                            : 'bg-emerald-500 text-white shadow-emerald-200'
                                        }`}>
                                            {isAdminView ? 'Admin Mode' : 'User Mode'}
                                        </span>
                                    )}
                                </div>
                                {user.role === 'Admin' && (
                                    <button
                                        onClick={handleToggle}
                                        className="p-2 text-amber-600 hover:text-amber-700 transition-colors rounded-lg hover:bg-amber-50"
                                        title={isAdminView ? "Switch to User View" : "Switch to Admin View"}
                                    >
                                        <ArrowLeftRight className="h-5 w-5" />
                                    </button>
                                )}

                                {/* Alerts Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAlerts(!showAlerts)}
                                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-50 relative"
                                        title="Notifications"
                                    >
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showAlerts && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                                                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                                                    {unreadCount} Unread
                                                </span>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {alerts.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <Info className="mx-auto h-8 w-8 text-slate-200 mb-2" />
                                                        <p className="text-xs text-slate-400 font-medium">No alerts yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-50">
                                                        {alerts.map((alert) => (
                                                            <div 
                                                                key={alert._id} 
                                                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!alert.isRead ? 'bg-indigo-50/30' : ''}`}
                                                                onClick={() => {
                                                                    if (alert.relatedId) navigate(`/ip/${alert.relatedId}`);
                                                                    setShowAlerts(false);
                                                                }}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <p className={`text-xs font-bold ${!alert.isRead ? 'text-indigo-600' : 'text-slate-900'}`}>
                                                                        {alert.title}
                                                                    </p>
                                                                    {!alert.isRead && (
                                                                        <button 
                                                                            onClick={(e) => handleMarkAsRead(alert._id, e)}
                                                                            className="opacity-0 group-hover:opacity-100 p-1 bg-white border border-slate-200 rounded-md shadow-sm hover:text-indigo-600 transition-all"
                                                                        >
                                                                            <Check size={10} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                                                    {alert.message}
                                                                </p>
                                                                <p className="text-[9px] text-slate-400 mt-2 font-medium">
                                                                    {new Date(alert.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to="/settings"
                                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50 lg:hidden"
                                    title="Settings"
                                >
                                    <SettingsIcon className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="hidden lg:inline-flex items-center gap-2 text-white bg-rose-600 hover:bg-rose-700 transition-colors px-4 py-2 rounded-xl font-bold shadow-sm shadow-rose-200"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                                
                                {/* Mobile Logout button */}
                                <button
                                    onClick={handleLogout}
                                    className="lg:hidden p-2 text-rose-500 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/verify"
                                    className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-bold transition-colors"
                                >
                                    Verify IP
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-indigo-200"
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
