import React, { useContext, useEffect, useState } from 'react';
import {
  ShieldCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  FilePlus,
  AlertCircle,
  ArrowUpRight,
  Database,
  Bell,
  Gavel,
  BarChart3,
  PlusCircle,
  Activity,
  CheckCircle2,
  AlertTriangle, // Added AlertTriangle
  Search // Added Search for the new quick action
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';
import { CHART_DATA } from '../constants';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import

export default function CreatorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, alertRes] = await Promise.all([
          api.get('/dashboard/creator'),
          api.get('/alerts')
        ]);
        setDashboardData(dashRes.data);
        setAlerts(alertRes.data.slice(0, 5));

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'My IP Assets', value: dashboardData?.stats.totalAssets || 0, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Pending Approval', value: dashboardData?.stats.pendingApprovals || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Active Licenses', value: dashboardData?.stats.activeLicenses || 0, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Open Disputes', value: dashboardData?.stats.openDisputes || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-slate-500 text-sm">Here is the latest pulse on your intellectual property portfolio.</p>
        </div>

        {/* Replaced existing buttons with new grid of Link components */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/register-ip" className="group p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl hover:shadow-lg hover:shadow-indigo-100 transition-all flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Register New IP</h3>
              <p className="text-xs text-slate-500 mt-1">Submit a new patent, trademark, or copyright hash</p>
            </div>
          </Link>

          <Link to="/ips" className="group p-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-3xl hover:shadow-lg hover:shadow-emerald-100 transition-all flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Browse Registry</h3>
              <p className="text-xs text-slate-500 mt-1">Search the global IP blockchain database</p>
            </div>
          </Link>

          <Link to="/file-dispute" className="group p-6 bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-3xl hover:shadow-lg hover:shadow-rose-100 transition-all flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">File a Dispute</h3>
              <p className="text-xs text-slate-500 mt-1">Lodge a formal claim against an existing IP</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid with Hover Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-shadow duration-300 relative overflow-hidden"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 relative z-10`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">{stat.title}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 relative z-10">{stat.value}</h3>

            {/* Background Accent Gradient */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-300 mix-blend-multiply ${stat.bg.replace('bg-', 'bg-')}`}></div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Earnings Area Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <IndianRupee className="text-indigo-500" size={20} /> Earnings Growth
              </h3>
              <p className="text-xs text-slate-500 mt-1">Your royalty income over the last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Total Earned</p>
              <p className="text-2xl font-black text-indigo-600 tracking-tight">₹{(dashboardData?.stats.totalRoyalty || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA.royalty}>
                <defs>
                  <linearGradient id="colorRoyalty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val / 1000}k`} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRoyalty)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Notification Feed (Spans 1 column) */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="text-indigo-500" size={20} /> System Alerts
            </h3>
            {alerts.filter(a => !a.isRead).length > 0 && <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">{alerts.filter(a => !a.isRead).length} New</span>}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center mt-10">No active alerts right now.</p>
            ) : (
              alerts.map((alert: any, idx) => (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className={`p-4 rounded-2xl border transition-colors bg-white ${!alert.isRead ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100'} shadow-sm cursor-pointer hover:border-indigo-300 group`}
                  onClick={() => alert.relatedId && navigate(`/ips/${alert.relatedId}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${!alert.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {alert.type === 'Expiration' ? <Clock size={14} /> : alert.type === 'License' ? <Database size={14} /> : <Bell size={14} />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors`}>{alert.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{alert.message}</p>
                      <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase tracking-wider">{new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <button className="w-full mt-6 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 rounded-xl transition-colors">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Expanded Recent Assets Feed */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="text-indigo-500" size={20} /> Internal IP Registry
            </h3>
            <p className="text-xs text-slate-500 mt-1">Your 5 most recently updated Intellectual Property assets</p>
          </div>
          <button onClick={() => navigate('/ips')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors hidden sm:block">View Full Directory &rarr;</button>
        </div>

        {dashboardData?.recentAssets.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <FilePlus className="text-slate-300 w-12 h-12 mb-3" />
            <h4 className="text-slate-700 font-bold">No Assets Found</h4>
            <p className="text-slate-500 text-sm max-w-sm mt-1">You haven't registered any Intellectual Property yet. Click the "Register IP" button to secure your first document.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {dashboardData?.recentAssets.map((ip: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={ip._id}
                onClick={() => navigate(`/ips/${ip._id}`)}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${ip.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                      {ip.status}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">{ip.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{ip.category}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">TX HASH</p>
                  <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5" title={ip.fileHash || ip.txHash}>{ip.fileHash || ip.txHash || 'Pending TX'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions Feed */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="text-emerald-500" size={20} /> License Sales & Royalty History
            </h3>
            <p className="text-xs text-slate-500 mt-1">Your most recent incoming payments from IP licensing</p>
          </div>
          <Link to="/royalty-history" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">View All Statements &rarr;</Link>
        </div>

        {dashboardData?.recentTransactions.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardData?.recentTransactions.map((tx: any) => (
                  <tr key={tx._id} className="text-xs hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-mono font-bold text-slate-900">{tx.txId}</td>
                    <td className="px-4 py-4 font-bold text-slate-700">{tx.assetTitle}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.type === 'License Purchase' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-black text-indigo-600">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-400 text-right">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
