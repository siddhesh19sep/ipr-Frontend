import React, { useEffect, useState } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  Download, 
  Filter, 
  Search, 
  ArrowRight,
  Wallet,
  Building2,
  AlertCircle,
  ArrowDownRight,
  Loader2,
  CheckCircle2,
  History,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';

interface Transaction {
  _id: string;
  txId: string;
  assetTitle?: string;
  type: 'License Fee' | 'Usage Royalty' | 'Payout' | 'Registration Fee' | 'Platform Income';
  amount: number;
  status: 'Credited' | 'Pending' | 'Processing' | 'Completed' | 'Failed';
  createdAt: string;
}

export default function AdminRoyalties() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      // Admin route returning the complete ledger
      const res = await api.get('/transactions/all');
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to load global transaction data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.type === "Platform Income" || t.type === "Registration Fee")
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const totalRoyaltyVolume = transactions
    .filter(t => t.type === "Usage Royalty" || t.type === "License Fee")
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const filteredTransactions = transactions.filter(tx => 
    tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (tx.assetTitle && tx.assetTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Syncing live global ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            Platform Ledger
          </h1>
          <p className="text-slate-500 mt-2">Comprehensive audit log of all financial transactions across the IPR network</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-2xl w-fit">
                <Building2 size={24} />
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                Platform Earnings
              </span>
            </div>
            <p className="text-indigo-100 font-medium mb-1 line-clamp-1 text-sm">Total Network Revenue</p>
            <h3 className="text-4xl font-black tracking-tight">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-2xl w-fit">
                <TrendingUp size={24} />
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                Creator Volume
              </span>
            </div>
            <p className="text-emerald-100 font-medium mb-1 line-clamp-1 text-sm">Total Royalties Generated</p>
            <h3 className="text-4xl font-black tracking-tight">₹{totalRoyaltyVolume.toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 text-slate-500 rounded-2xl w-fit group-hover:bg-slate-100 transition-colors">
                <History size={24} />
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Ledger Scale
              </span>
            </div>
            <p className="text-slate-500 font-medium mb-1 line-clamp-1 text-sm">Total Global Transactions</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{transactions.length.toLocaleString()}</h3>
          </div>
        </motion.div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100/60 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">Comprehensive Ledger Log</h2>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search TX ID or Asset..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm bg-white shadow-sm">
                <Filter size={16} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction</th>
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                <th className="text-right px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                <th className="text-right px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <div className="inline-flex flex-col items-center justify-center text-slate-400">
                        <History size={48} className="mb-4 opacity-20" />
                        <p className="font-medium text-slate-500">No transactions found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={tx._id} 
                      className="hover:bg-slate-50/50 transition-colors group cursor-default"
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm mb-0.5">{tx.txId}</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(tx.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-sm font-bold text-slate-800 line-clamp-1">{tx.assetTitle || 'Platform Event'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            tx.type === 'Platform Income' ? 'bg-indigo-100 text-indigo-700' :
                            tx.type === 'Registration Fee' ? 'bg-rose-100 text-rose-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-base font-black ${
                            tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            ₹{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {tx.amount < 0 ? 
                            <ArrowDownRight size={16} className="text-rose-500" /> : 
                            <ArrowUpRight size={16} className="text-emerald-500" />
                          }
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${
                          tx.status === 'Completed' || tx.status === 'Credited' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          tx.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          tx.status === 'Failed' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {tx.status === 'Completed' || tx.status === 'Credited' ? <CheckCircle2 size={14} /> : null}
                          {tx.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
