import React, { useState } from 'react';
import { Search, Filter, ExternalLink, Shield, Database, Clock, MoreVertical, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_IPS } from '../constants';

export default function MyAssets() {
  const [searchTerm, setSearchTerm] = useState('');
  const myIps = MOCK_IPS.filter(ip => ip.ownerId === '1'); // Assuming logged in user is Aarav Mehta

  const filteredIps = myIps.filter(ip => 
    ip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ip.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My IP Assets</h1>
          <p className="text-slate-500 text-sm">Manage and track your registered intellectual property</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100">
            {myIps.length} Total Assets
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assets by title or ID..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all w-full md:w-auto justify-center">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIps.map((ip, idx) => (
          <motion.div 
            key={ip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-8 group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                ip.category === 'Patent' ? 'bg-indigo-50 text-indigo-600' :
                ip.category === 'Copyright' ? 'bg-purple-50 text-purple-600' :
                ip.category === 'Trademark' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <FileText size={28} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  ip.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {ip.status}
                </span>
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{ip.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{ip.category} • Registered on {ip.timestamp.split(' ')[0]}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Database size={12} />
                    Blockchain Hash
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-900">{ip.blockchainHash}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Shield size={12} />
                    Royalty Earned
                  </div>
                  <span className="text-xs font-bold text-emerald-600">₹{ip.royaltyEarned.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                  <ExternalLink size={14} />
                  View Certificate
                </button>
                <button className="flex-1 py-3 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  License Asset
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredIps.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No assets found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}
