import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { Download, FileText, Calendar, Filter, ArrowUpRight, TrendingUp, PieChart as PieChartIcon, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';

export default function ReportsAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const revenueData = data?.stats.revenueTrend || [];
  const registrationData = data?.stats.registrationsTrend || [];
  const categoryData = data?.categories || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm">Deep insights into system performance and revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-xs font-bold text-slate-500">Live Ledger Feed</span>
          </div>
          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Avg. Verification Time', value: '1.4 Days', icon: Clock, trend: '-12%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Platform Income', value: `₹${(data?.stats.registrationRevenue || 0).toLocaleString()}`, icon: TrendingUp, trend: '+24%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Pending Verifications', value: data?.stats.pendingApprovals || 0, icon: AlertTriangle, trend: 'Active', color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                <item.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {item.trend}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{item.title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 gap-8">
        {/* Revenue Trends */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Platform Income Trend</h3>
              <p className="text-xs text-slate-500">Monthly breakdown of registration fees collected</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                <span className="text-xs font-medium text-slate-600">Platform Income</span>
              </div>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.length > 0 ? revenueData : [{ month: 'N/A', amount: 0 }]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val>=1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Income']}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Registration Trends */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-8">Registration Velocity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationData.length > 0 ? registrationData : [{ month: 'N/A', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Line type="step" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-8">Category-wise Analysis</h3>
            <div className="space-y-6">
              {categoryData.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10">No data available yet</p>
              ) : categoryData.map((cat: any, idx: number) => {
                const total = categoryData.reduce((acc: number, curr: any) => acc + curr.value, 0);
                const percentage = Math.round((cat.value / total) * 100);
                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                      <span className="text-xs font-bold text-indigo-600">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-indigo-600' : 
                          idx === 1 ? 'bg-purple-500' : 
                          idx === 2 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
