import { useEffect, useState } from 'react';
import { ShieldCheck, Clock, FileText, ExternalLink, CheckCircle, XCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';

interface IPLiveData {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  fileHash: string;
  txHash?: string;
  createdAt: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function VerificationModule() {
  const [selectedIP, setSelectedIP] = useState<IPLiveData | null>(null);
  const [ips, setIps] = useState<IPLiveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIPs = async () => {
      try {
        const res = await api.get('/ip/all');
        // Sort to show Pending IPs at the top
        const sortedData = res.data.sort((a: IPLiveData, b: IPLiveData) => {
          if (a.status === 'Pending' && b.status !== 'Pending') return -1;
          if (a.status !== 'Pending' && b.status === 'Pending') return 1;
          return 0;
        });
        setIps(sortedData);
      } catch (err) {
        console.error("Failed to load IPs for verification", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIPs();
  }, []);

  const handleAction = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/ip/${id}`, { status: newStatus });

      // Update local state to reflect the status change visually
      setIps(ips.map(ip => ip._id === id ? { ...ip, status: newStatus } : ip));

      // Optionally deselect or just update the selected one
      if (selectedIP && selectedIP._id === id) {
        setSelectedIP({ ...selectedIP, status: newStatus });
      }
    } catch (err) {
      console.error(`Failed to mark IP as ${newStatus}`, err);
      alert(`Could not update IP status.`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification & Validation</h1>
        <p className="text-slate-500 text-sm">Review and approve intellectual property submissions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* IP List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : ips.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No IPs found in the system.</div>
          ) : ips.map((ip) => (
            <motion.div
              key={ip._id}
              layoutId={ip._id}
              onClick={() => setSelectedIP(ip)}
              className={`bg-white p-6 rounded-[2rem] border transition-all cursor-pointer group ${selectedIP?._id === ip._id ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200 shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ip.category === 'Patent' ? 'bg-indigo-50 text-indigo-600' :
                    ip.category === 'Copyright' ? 'bg-purple-50 text-purple-600' :
                      ip.category === 'Trademark' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{ip.title}</h3>
                    <p className="text-xs text-slate-500">Submitted by <span className="font-semibold text-slate-700">{ip.owner?.name || 'Unknown'}</span> • {ip.category}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ip.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                  ip.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                  {ip.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(ip.createdAt).toLocaleDateString()}
                  </div>
                  {ip.txHash && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      <Database size={12} />
                      {ip.txHash.substring(0, 10)}...
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${ip.fileHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    View File <ExternalLink size={12} />
                  </a>
                  <button className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                    View Details <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedIP ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sticky top-24"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-slate-900">IP Review Panel</h3>
                  <button onClick={() => setSelectedIP(null)} className="text-slate-400 hover:text-slate-600">
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Metadata</p>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">IP ID</span>
                        <span className="text-xs font-mono font-bold text-slate-900">{selectedIP._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Category</span>
                        <span className="text-xs font-bold text-slate-900">{selectedIP.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Owner</span>
                        <span className="text-xs font-bold text-slate-900">{selectedIP.owner?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedIP.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Blockchain Proof</p>
                    <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-3">
                      <Database size={20} className="text-indigo-600" />
                      <div className="overflow-hidden w-full">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Transaction Hash</p>
                        <p className="text-xs font-mono font-bold text-slate-900 truncate">
                          {selectedIP.txHash ? selectedIP.txHash : 'Pending Blockchain Sync...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Original File Integrity Hash</p>
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                      <FileText size={20} className="text-slate-500" />
                      <div className="overflow-hidden w-full flex justify-between items-center">
                        <p className="text-xs font-mono font-bold text-slate-900 break-all w-2/3">
                          {selectedIP.fileHash}
                        </p>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${selectedIP.fileHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          View File <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review Comments</p>
                    <textarea
                      placeholder="Add internal notes or rejection reasons..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[100px]"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleAction(selectedIP._id, 'Rejected')}
                        className="flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-rose-500 hover:text-rose-500 transition-all"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(selectedIP._id, 'Approved')}
                        className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck size={32} />
                </div>
                <p className="font-bold text-slate-500">No IP Selected</p>
                <p className="text-xs mt-2">Select a submission from the list to review its details and blockchain proof.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
