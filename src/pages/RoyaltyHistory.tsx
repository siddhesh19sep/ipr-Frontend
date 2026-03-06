import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, ArrowUpRight, Calendar, Download, Filter, Search, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CHART_DATA } from '../constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../services/api';

interface LiveTransaction {
  _id: string;
  txId: string;
  assetTitle: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function RoyaltyHistory() {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTx();
  }, []);

  // Compute live analytics 
  const totalEarnings = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const licenseFees = transactions.filter(t => t.type === 'License Fee').reduce((acc, tx) => acc + tx.amount, 0);
  const usageFees = transactions.filter(t => t.type === 'Usage Royalty').reduce((acc, tx) => acc + tx.amount, 0);

  const licensePercentage = totalEarnings > 0 ? (licenseFees / totalEarnings) * 100 : 0;
  const usagePercentage = totalEarnings > 0 ? (usageFees / totalEarnings) * 100 : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Royalty History</h1>
          <p className="text-slate-500 text-sm">Track your earnings and payout history</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
          <Download size={18} />
          <span>Download Statement</span>
        </button>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Available Balance</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-2">₹{totalEarnings.toLocaleString()}</h2>
            <p className="text-indigo-100 text-xs flex items-center gap-2 mb-8">
              <TrendingUp size={14} />
              <span>+₹0 this week</span>
            </p>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all">
              Withdraw to Bank
            </button>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Earnings Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'License Fees', value: `₹${licenseFees.toLocaleString()}`, color: 'bg-indigo-500', width: `${licensePercentage}%` },
                { label: 'Usage Royalties', value: `₹${usageFees.toLocaleString()}`, color: 'bg-purple-500', width: `${usagePercentage}%` },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">{item.label}</span>
                    <span className="text-xs font-bold text-slate-900">{item.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Income Trend</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Calendar size={18} /></button>
              <select className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA.royalty}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h3 className="font-bold text-slate-900">Recent Payouts</h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"><Filter size={16} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">IP Asset</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex justify-center flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                      Syncing ledger...
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No recent royalty payouts generated.
                  </td>
                </tr>
              ) : transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4 text-xs font-bold text-slate-900">{tx.txId}</td>
                  <td className="px-8 py-4 text-[10px] uppercase font-bold text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-4 text-xs font-medium text-slate-700">{tx.assetTitle}</td>
                  <td className="px-8 py-4 text-xs text-slate-500">{tx.type}</td>
                  <td className="px-8 py-4 text-xs font-bold text-emerald-600">₹{tx.amount.toLocaleString()}</td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      <ArrowUpRight size={12} />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 text-center border-t border-slate-100">
          <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-2 mx-auto">
            View Full Transaction History <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
