import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BACKEND_ROOT_URL } from '../services/api';
import { 
  FileText, 
  Search, 
  AlertTriangle, 
  Clock, 
  Settings, 
  ShieldCheck,
  Gavel,
  User as UserIcon,
  Home,
  Key,
  LogOut,
  ArrowLeftRight
} from 'lucide-react';


const Sidebar: React.FC = () => {
    const { user, isAuthenticated, isAdminView, logout, toggleAdminView } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    if (!isAuthenticated || !user) return null;

    const navItems = isAdminView ? [
        { name: 'System Overview', path: '/admin-dashboard', icon: Home },
        { name: 'Verification Queue', path: '/verification', icon: ShieldCheck },
        { name: 'Dispute Queue', path: '/disputes', icon: Gavel },
        { name: 'License Marketplace', path: '/ips', icon: Search },
        { name: 'Royalty History', path: '/admin-royalties', icon: Clock },
        { name: 'Settings', path: '/settings', icon: Settings },
    ] : [

        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Register IP', path: '/register-ip', icon: FileText },
        { name: 'License Marketplace', path: '/ips', icon: Search },
        { name: 'My Licenses', path: '/my-licenses', icon: Key },
        { name: 'File Dispute', path: '/file-dispute', icon: AlertTriangle },
        { name: 'Royalty History', path: '/royalties', icon: Clock },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];


    return (
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-full flex-shrink-0 z-10 transition-all duration-300 shadow-xl">
            <div className="flex flex-col h-full py-8">
                
                {/* Profile Block at the top */}
                <Link to="/settings" className="px-6 mb-6 group block">
                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-transparent group-hover:bg-slate-800 group-hover:border-slate-700 transition-all">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 font-bold overflow-hidden shrink-0 shadow-inner border border-slate-700">
                            {user.avatarUrl ? (
                                <img src={BACKEND_ROOT_URL + user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user.name ? user.name.substring(0, 2).toUpperCase() : 'US'
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                                {user.name || 'Anonymous User'}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                                {user.role === 'User' ? 'User' : user.role}
                            </p>
                        </div>
                    </div>
                </Link>

                <div className="px-6 mb-8 flex-1">
                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(`${item.path}`);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                        isActive 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                    }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>



                <div className="px-6 mt-auto">
                    {user.role === 'Admin' && (
                        <button
                            onClick={() => {
                                toggleAdminView();
                                navigate(isAdminView ? '/dashboard' : '/admin-dashboard');
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all border border-indigo-500/20 mb-4 group"
                        >
                            <span className="flex items-center gap-3">
                                <ArrowLeftRight className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                                {isAdminView ? 'Switch to Creator Hub' : 'Switch to Admin Panel'}
                            </span>
                        </button>
                    )}

                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 backdrop-blur-sm mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="text-emerald-400 h-5 w-5 drop-shadow-sm" />
                            <span className="text-xs font-bold text-white">Secure Network</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Connected to Polygon Amoy Testnet. All IP transactions are verified.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20 mb-2"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
