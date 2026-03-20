import { useEffect, useState, useContext } from 'react';
import { Gavel, Search, Filter, AlertTriangle, CheckCircle, Clock, FileText, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

interface LiveDispute {
  _id: string;
  ipId: string;
  ipTitle: string;
  filedBy: { _id: string, name: string, email: string };
  opponent: { _id: string, name: string, email: string };
  evidence: string;
  status: 'Open' | 'In Review' | 'Resolved' | 'Dismissed';
  notes: string;
  decision: string;
  createdAt: string;
}

export default function DisputeResolution() {
  const { user } = useContext(AuthContext);
  const [selectedDispute, setSelectedDispute] = useState<LiveDispute | null>(null);
  const [disputes, setDisputes] = useState<LiveDispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminDecision, setAdminDecision] = useState('');

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await api.get('/disputes');
        setDisputes(res.data);
      } catch (err) {
        console.error('Failed to fetch disputes', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const handleCaseAction = async (id: string, newStatus: 'Resolved' | 'Dismissed' | 'In Review') => {
    try {
      await api.put(`/disputes/${id}`, { 
        status: newStatus, 
        decision: newStatus !== 'In Review' ? adminDecision : undefined 
      });
      const updated = disputes.map(d => d._id === id ? { ...d, status: newStatus, decision: adminDecision } : d);
      setDisputes(updated);
      if (selectedDispute && selectedDispute._id === id) {
        setSelectedDispute({ ...selectedDispute, status: newStatus, decision: adminDecision });
      }
      setAdminDecision('');
      alert(`Case ${newStatus} successfully.`);
    } catch (err) {
      console.error(`Failed to update dispute to ${newStatus}`, err);
      alert('Failed to update dispute status.');
    }
  };

  const filteredDisputes = disputes.filter(d =>
    d.ipTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispute Resolution</h1>
          <p className="text-slate-500 text-sm">Manage and resolve intellectual property conflicts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-100">
            <AlertTriangle size={16} />
            <span>{disputes.filter(d => d.status === 'Open').length} Urgent Cases</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Dispute List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by Dispute ID or IP Title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dispute ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">IP Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Filed By</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Opponent</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      <div className="flex justify-center flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                        Loading latest cases...
                      </div>
                    </td>
                  </tr>
                ) : filteredDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No disputes found.
                    </td>
                  </tr>
                ) : filteredDisputes.map((dispute) => (
                  <tr key={dispute._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedDispute(dispute)}>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono font-bold text-slate-900">{dispute._id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{dispute.ipTitle}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{dispute.ipId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700">{dispute.filedBy?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700">{dispute.opponent?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${dispute.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
                        dispute.status === 'Open' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 text-xs font-bold hover:underline">View Case</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Case Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDispute ? (
              <motion.div
                key="dispute-detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sticky top-24"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-slate-900">Case Details</h3>
                  <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-slate-600">
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                      <Gavel size={24} />
                    </div>
                    <div className="w-full">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case ID</p>
                      <p className="text-xs font-mono font-bold text-slate-900 break-all">{selectedDispute._id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filed By</p>
                      <p className="text-xs font-bold text-slate-900">{selectedDispute.filedBy?.name || 'Unknown'}</p>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Opponent</p>
                      <p className="text-xs font-bold text-slate-900">{selectedDispute.opponent?.name || 'Unknown'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Evidence Provided</p>
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                      <FileText size={18} className="text-indigo-600 mt-0.5" />
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedDispute.evidence}</p>
                    </div>
                  </div>

                  {user?.role === 'Admin' && (selectedDispute.status === 'Open' || selectedDispute.status === 'In Review') && (
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Verdict / Decision</label>
                        <textarea
                          value={adminDecision}
                          onChange={(e) => setAdminDecision(e.target.value)}
                          placeholder="Provide the rationale for your decision..."
                          className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 min-h-[100px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleCaseAction(selectedDispute._id, 'Dismissed')}
                          className="py-3 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          Dismiss Case
                        </button>
                        <button
                          onClick={() => handleCaseAction(selectedDispute._id, 'Resolved')}
                          className="py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                          Resolve Case
                        </button>
                      </div>
                      {selectedDispute.status === 'Open' && (
                        <button
                          onClick={() => handleCaseAction(selectedDispute._id, 'In Review')}
                          className="w-full py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                        >
                          Mark as In Review
                        </button>
                      )}
                    </div>
                  )}

                  {selectedDispute.decision && (
                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Formal Verdict</p>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                         <p className="text-xs text-emerald-800 font-medium leading-relaxed">{selectedDispute.decision}</p>
                      </div>
                    </div>
                  )}

                  {(selectedDispute.status === 'Resolved' || selectedDispute.status === 'Dismissed') && (
                    <div className="pt-6 border-t border-slate-100 text-center">
                      <span className="inline-flex items-center text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-lg">
                        This case has been {selectedDispute.status}.
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Gavel size={32} />
                </div>
                <p className="font-bold text-slate-500">No Case Selected</p>
                <p className="text-xs mt-2">Select a dispute from the list to view evidence and take legal action.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function XCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
