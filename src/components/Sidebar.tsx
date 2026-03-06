import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Gavel,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const adminNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'User Management', icon: Users, path: '/admin/users' },
  { name: 'Verification', icon: ShieldCheck, path: '/admin/verification' },
  { name: 'Disputes', icon: Gavel, path: '/admin/disputes' },
  { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

const userNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
  { name: 'Register IP', icon: ShieldCheck, path: '/user/register' },
  { name: 'My Assets', icon: Users, path: '/user/assets' },
  { name: 'Royalty History', icon: BarChart3, path: '/user/royalties' },
  { name: 'Settings', icon: Settings, path: '/user/settings' },
];

export default function Sidebar({ role, onLogout }: { role: 'Admin' | 'User', onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const navItems = role === 'Admin' ? adminNavItems : userNavItems;

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Shield size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">IPR Shield</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="px-4 py-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
          <div className="flex-shrink-0">
            <Wallet size={20} className={user?.walletAddress ? "text-green-500" : "text-slate-400"} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-700">Web3 Status</span>
            <span className="text-xs text-slate-500 truncate mt-0.5">
              {user?.walletAddress ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:text-red-600" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
