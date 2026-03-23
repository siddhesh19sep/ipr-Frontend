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
  Plus,
  ArrowDownLeft,
  Loader2,
  CheckCircle2,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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

interface BankDetails {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  holderName: string;
}

export default function Payments() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails>({ accountNumber: '', ifsc: '', bankName: '', holderName: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const [txRes, bankRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/payouts/bank-details')
      ]);
      setTransactions(txRes.data);
      if (bankRes.data) setBankDetails(bankRes.data);
    } catch (err) {
      console.error("Failed to load payment data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalEarnings = transactions
    .filter(t => ["License Fee", "Usage Royalty", "Platform Income"].includes(t.type) && ["Credited", "Completed"].includes(t.status))
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const totalFees = transactions
    .filter(t => t.type === "Registration Fee")
    .reduce((acc, tx) => acc + tx.amount, 0); // These are negative numbers

  const totalWithdrawn = transactions
    .filter(t => t.type === "Payout" && ["Processing", "Completed"].includes(t.status))
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const availableBalance = totalEarnings + totalFees - totalWithdrawn;

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/payouts/request', { amount: Number(payoutAmount) });
      setMessage({ text: 'Payout request submitted successfully!', type: 'success' });
      setIsPayoutModalOpen(false);
      setPayoutAmount('');
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed to request payout', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/payouts/bank-details', bankDetails);
      setMessage({ text: 'Bank details updated successfully!', type: 'success' });
      setIsBankModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed to update bank details', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Notifications */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-8 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Royalty & Wallet Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage your registered IP earnings, platform royalties and payouts</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsBankModalOpen(true)}
                className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
                <Building2 size={18} />
                <span>Bank Settings</span>
            </button>
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                <Download size={18} />
                <span>Export History</span>
            </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Stats & Analytics */}
        <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-24">
          {/* Balance Card */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Wallet size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Available Balance</span>
                </div>
                <h2 className="text-4xl font-extrabold mb-2">₹{availableBalance.toLocaleString()}</h2>
                <div className="flex items-center gap-4 mb-8">
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={12} />
                        <span>Lifetime: ₹{totalEarnings.toLocaleString()}</span>
                    </p>
                    <div className="w-1 h-1 bg-white/30 rounded-full" />
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <History size={12} />
                        <span>Withdrawn: ₹{totalWithdrawn.toLocaleString()}</span>
                    </p>
                </div>
                <button 
                    onClick={() => setIsPayoutModalOpen(true)}
                    disabled={availableBalance <= 0}
                    className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    Withdraw to Bank
                </button>
            </div>
          </div>

          {/* Bank Status Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Primary Payout Method</h3>
                <Building2 size={18} className="text-slate-400" />
            </div>
            {bankDetails.accountNumber ? (
                <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Name</p>
                        <p className="text-sm font-bold text-slate-800">{bankDetails.bankName}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">A/C Number</p>
                            <p className="text-sm font-bold text-slate-800">•••• {bankDetails.accountNumber.slice(-4)}</p>
                        </div>
                        <div className="flex-1 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Status</p>
                            <p className="text-sm font-bold text-emerald-700">Verified</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={24} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-4">No bank account linked</p>
                    <button 
                        onClick={() => setIsBankModalOpen(true)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mx-auto"
                    >
                        <Plus size={14} /> Link Now
                    </button>
                </div>
            )}
          </div>

          {/* Analytics Chart (Compact) */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-sm">Income vs Payout</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">Live</span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={
                  // Generate dynamic chart data from transactions
                  (() => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const dataMap = new Map();
                    
                    // Initialize last 6 months
                    const now = new Date();
                    for (let i = 5; i >= 0; i--) {
                      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      dataMap.set(months[d.getMonth()], 0);
                    }

                    transactions
                      .filter(t => ["License Fee", "Usage Royalty", "Platform Income"].includes(t.type) && ["Credited", "Completed"].includes(t.status))
                      .forEach(t => {
                        const m = months[new Date(t.createdAt).getMonth()];
                        if (dataMap.has(m)) {
                          dataMap.set(m, dataMap.get(m) + Math.abs(t.amount));
                        }
                      });

                    return Array.from(dataMap.entries()).map(([month, amount]) => ({ month, amount }));
                  })()
                }>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`} width={40} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Income']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Table */}
        <div className="xl:col-span-2">

      {/* Transaction Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900">Transaction History</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{transactions.length} total</span>
          </div>
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
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID & Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="flex justify-center flex-col items-center">
                      <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mb-4" />
                      <p className="text-sm font-bold text-slate-500">Syncing ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-500 font-medium">
                    No transactions found in your records.
                  </td>
                </tr>
              ) : transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-900 mb-0.5">{tx.txId}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-700">{tx.assetTitle || (tx.type === 'Payout' ? 'Withdrawal to Bank' : 'Platform Transaction')}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.type === 'Payout' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                        {tx.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className={`text-xs font-extrabold flex items-center gap-1 ${
                        tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                        {tx.amount < 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        ₹{Math.abs(tx.amount).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'Completed' || tx.status === 'Credited' ? 'bg-emerald-50 text-emerald-600' :
                        tx.status === 'Processing' || tx.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={() => setIsPayoutModalOpen(false)}
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl border border-slate-100"
            >
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Request Withdrawal</h2>
                <p className="text-slate-500 text-sm mb-8">Funds will be credited to your linked bank account within 2-3 business days.</p>
                
                <form onSubmit={handlePayout} className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Enter Amount (INR)</label>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-extrabold text-slate-300">₹</span>
                            <input 
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*" 
                                value={payoutAmount}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                    // Only allow one decimal point
                                    const parts = val.split('.');
                                    const sanitized = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                                    setPayoutAmount(sanitized);
                                }}
                                placeholder="0.00"
                                className="w-full bg-transparent border-none text-4xl font-extrabold text-slate-900 focus:ring-0 pl-8 placeholder:text-slate-200"
                                required
                            />
                        </div>
                        <div className="mt-6 flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
                            <span className="text-xs font-bold text-slate-900">₹{availableBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
                        <AlertCircle size={18} className="shrink-0" />
                        <p className="text-[10px] font-bold leading-relaxed">
                            Ensure your bank details are correct. Transfers to incorrect accounts cannot be reversed.
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting || Number(payoutAmount) <= 0 || Number(payoutAmount) > availableBalance}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm Withdrawal'}
                    </button>
                </form>
            </motion.div>
        </div>
      )}

      {/* Bank Settings Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={() => setIsBankModalOpen(false)}
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl border border-slate-100"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Bank Settings</h2>
                        <p className="text-slate-500 text-sm">Configure your primary payout destination</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Building2 size={24} />
                    </div>
                </div>
                
                <form onSubmit={handleUpdateBank} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Account Holder Name</label>
                        <input 
                            type="text" 
                            value={bankDetails.holderName}
                            onChange={(e) => setBankDetails({...bankDetails, holderName: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Account Number</label>
                        <input 
                            type="text" 
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="XXXX XXXX XXXX XXXX"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">IFSC Code</label>
                        <input 
                            type="text" 
                            value={bankDetails.ifsc}
                            onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="SBIN0001234"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Bank Name</label>
                        <input 
                            type="text" 
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="State Bank of India"
                            required
                        />
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Bank Details'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
      )}
    </div>
  );
}
