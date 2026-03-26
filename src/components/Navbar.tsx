import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Web3Context } from '../context/Web3Context';
import { LogOut, Shield, Settings as SettingsIcon, ArrowLeftRight, Bell, Check, Trash2, Info, Wallet, ExternalLink } from 'lucide-react';
import * as api from '../services/api';
import GlobalSearch from './GlobalSearch';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout, isAdminView, toggleAdminView } = useContext(AuthContext);
    const { account, connectWallet, isConnecting } = useContext(Web3Context);
    const navigate = useNavigate();
    const [alerts, setAlerts] = React.useState<any[]>([]);
    const [showAlerts, setShowAlerts] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [showWalletMenu, setShowWalletMenu] = React.useState(false);

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
                                </div>

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
                                                                    if (alert.relatedId) navigate(`/ips/${alert.relatedId}`);
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

                        {/* Shared Wallet Button (Visible for all) */}
                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                            <div className="relative">
                                {account && (
                                    <div className="flex flex-col items-end mr-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                                            {user?.role === 'Admin' ? 'Admin Blockchain ID' : 'Polygon Wallet'}
                                        </span>
                                        <div className="h-0.5 w-8 bg-indigo-500 rounded-full opacity-50"></div>
                                    </div>
                                )}
                                <button
                                    onClick={() => account ? setShowWalletMenu(!showWalletMenu) : connectWallet()}
                                    disabled={isConnecting}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                        account 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                                        : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-sm shadow-indigo-100'
                                    }`}
                                >
                                    <Wallet size={14} />
                                    {account 
                                        ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` 
                                        : isConnecting ? 'Connecting...' : 'Connect Wallet'}
                                </button>
                                
                                {showWalletMenu && account && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Connected Wallet</p>
                                            <p className="text-[10px] font-mono text-slate-600 break-all bg-white p-2 rounded-lg border border-slate-100 shadow-inner">
                                                {account}
                                            </p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <a 
                                                href={`https://amoy.polygonscan.com/address/${account}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                                            >
                                                <ExternalLink size={14} /> View on Polygonscan
                                            </a>
                                            <button 
                                                onClick={() => {
                                                    // Note: We don't have a formal disconnect in basic ethers Web3Context 
                                                    // but we can clear the state in the context if we had a disconnect function
                                                    setShowWalletMenu(false);
                                                }}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-t border-slate-50 mt-1"
                                            >
                                                <LogOut size={14} /> Disconnect
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {isAuthenticated && user && !showWalletMenu && (
                                    <div className="absolute right-0 top-full mt-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-bold z-50">
                                        Logged in as {user.role}: {user.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
