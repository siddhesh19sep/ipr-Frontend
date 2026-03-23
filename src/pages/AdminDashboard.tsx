import {
  Users,
  ShieldCheck,
  Gavel,
  IndianRupee,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { CHART_DATA } from '../constants';
import api from '../services/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pricingMatrix, setPricingMatrix] = useState<Record<string, number>>({
    Patent: 750, Trademark: 850, Copyright: 35, 'Trade Secret': 50, Other: 100
  });
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // In a real app we would fetch the recent IP activity list here as well, 
        // but for now we focus on the raw stats requested.
        const res = await api.get('/dashboard/admin');
        setDashboardData(res.data);

        const pricingRes = await api.get('/settings/pricing');
        if (pricingRes.data) setPricingMatrix(pricingRes.data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const handleSavePricing = async () => {
    setIsSavingPricing(true);
    try {
      await api.put('/settings/pricing', { pricingMatrix });
      alert("Platform pricing updated successfully!");
    } catch (err) {
      console.error("Failed to update pricing", err);
      alert("Failed to update pricing settings.");
    } finally {
      setIsSavingPricing(false);
    }
  };

  const stats = [
    { title: 'Total IP Registrations', value: dashboardData?.stats.totalRegistrations || 0, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12%', up: true },
    { title: 'IPs Under Verification', value: dashboardData?.stats.pendingApprovals || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-5%', up: false },
    { title: 'Active Licenses', value: dashboardData?.stats.activeLicenses || 0, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8%', up: true },
    { title: 'Disputes Raised', value: dashboardData?.stats.disputesRaised || 0, icon: Gavel, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+2', up: true },
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500 text-sm">Real-time analytics for the IPR Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Revenue Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
        >
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <IndianRupee size={20} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest opacity-80">Total Platform Revenue</span>
                </div>
                <h2 className="text-5xl font-extrabold">₹{(dashboardData?.stats.totalRevenue || 0).toLocaleString()}</h2>
                <div className="flex items-center gap-4">
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={14} />
                        <span>+₹0 this week</span>
                    </p>
                </div>
            </div>
            <div className="h-32 w-full md:w-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData?.stats.revenueTrend?.length > 0 ? dashboardData.stats.revenueTrend : [
                        { month: 'N/A', amount: 0 }
                    ]}>
                        <Line type="monotone" dataKey="amount" stroke="#fff" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration Fees</p>
                    <ShieldCheck size={16} className="text-indigo-500" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900">₹{(dashboardData?.stats.registrationRevenue || 0).toLocaleString()}</h4>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${(dashboardData?.stats.registrationRevenue / (dashboardData?.stats.totalRevenue || 1)) * 100}%` }} 
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Royalty</p>
                    <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900">₹{(dashboardData?.stats.royaltyRevenue || 0).toLocaleString()}</h4>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${(dashboardData?.stats.royaltyRevenue / (dashboardData?.stats.totalRevenue || 1)) * 100}%` }} 
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Registrations */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Monthly IP Registrations</h3>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-500 rounded-full" />
                <span className="text-xs font-bold text-slate-500">Live Registration Sync</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.stats.registrationsTrend?.length > 0 ? dashboardData.stats.registrationsTrend : [
                  { month: 'No Data', count: 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IP Categories */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8">IP Categories Distribution</h3>
          <div className="h-80 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              {dashboardData?.categories && dashboardData.categories.length > 0 ? (
                <PieChart>
                  <Pie
                    data={dashboardData.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center text-sm font-medium break-words">
                  No categories data available
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform Customization Section (Admin Only) */}
      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee size={20} className="text-indigo-600" />
            Global Platform Customization
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Configure the base rate (Per Year) for IP Registration. Standard users will be charged this base amount multiplied by their selected Validity Period.
          </p>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(pricingMatrix).map(([category, cost]) => (
              <div key={category} className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{category} (Per Year)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">₹</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={cost}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPricingMatrix({ ...pricingMatrix, [category]: val === '' ? 0 : parseInt(val, 10) });
                    }}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSavePricing}
              disabled={isSavingPricing}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {isSavingPricing ? 'Updating Network...' : 'Save Pricing Matrix'}
            </button>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Recent Activity</h3>
          <button onClick={() => navigate('/ips')} className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">
          Please check the Verification Dashboard or IP Registry to view active platform registrations.
        </div>
      </div>
    </div>
  );
}
