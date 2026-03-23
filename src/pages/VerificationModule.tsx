import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, FileText, ExternalLink, CheckCircle, XCircle, Database, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';

interface IPLiveData {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  fileHash: string;
  fileData?: string;
  gridFsId?: string;
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
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    try {
      const res = await api.put(`/ip/${id}`, { status: newStatus });
      const updatedIP = res.data.ip || res.data;

      // Update local state to reflect the all changes including txHash and fileData
      setIps(ips.map(ip => ip._id === id ? { ...ip, ...updatedIP } : ip));

      // Update selected one
      if (selectedIP && selectedIP._id === id) {
        setSelectedIP({ ...selectedIP, ...updatedIP });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Could not update IP status.";
      const details = err.response?.data?.details ? `\nDetails: ${err.response.data.details}` : "";
      alert(`${errorMsg}${details}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectIP = (ip: IPLiveData) => {
    setSelectedIP(ip);
  };

  const [isFileLoading, setIsFileLoading] = useState(false);

  const openBase64Document = (base64Data: string) => {
      // If it's not a base64 string, just open it normally
      if (!base64Data.startsWith('data:')) {
          window.open(base64Data, '_blank');
          return;
      }
      
      const newWindow = window.open();
      if (newWindow) {
          // Tell the new window to render the base64 string as a document/image source in a full-screen iframe
          newWindow.document.write(`
              <html>
                  <head><title>Document Viewer</title></head>
                  <body style="margin:0; height:100vh; display:flex; justify-content:center; align-items:center; background:#1e1e1e;">
                      <iframe src="${base64Data}" width="100%" height="100%" style="border:none;"></iframe>
                  </body>
              </html>
          `);
          newWindow.document.close();
      } else {
          alert('Please allow popups to view the document.');
      }
  };

  const handleInspect = async (ip: IPLiveData) => {
    if (ip.fileData && ip.fileData !== 'LARGE_FILE_STORED_IN_GRIDFS') {
      openBase64Document(ip.fileData);
      return;
    }

    setIsFileLoading(true);
    try {
      const res = await api.get(`/ip/${ip._id}/file`);
      if (res.data.fileData) {
        // Update local list
        const updatedIps = ips.map(item => 
          item._id === ip._id ? { ...item, fileData: res.data.fileData } : item
        );
        setIps(updatedIps);
        setSelectedIP({ ...ip, fileData: res.data.fileData });
        
        // Open it properly instead of as raw text
        openBase64Document(res.data.fileData);
      }
    } catch (err) {
      console.error("Failed to lazy-fetch file data", err);
      alert("Failed to load file content.");
    } finally {
      setIsFileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification & Validation</h1>
        <p className="text-slate-500 text-sm">Review and approve intellectual property submissions</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* IP List */}
        <div className="space-y-4">
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
              onClick={() => handleSelectIP(ip)}
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
                  {ip.fileData || !ip.fileHash?.startsWith('QmMock') ? (
                    <a
                      href={ip.fileData || `https://gateway.pinata.cloud/ipfs/${ip.fileHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-500 hover:text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      View File <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-bold italic">Simulation Data</span>
                  )}
                  <Link 
                    to={`/ips/${ip._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
                  >
                    View Details <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Centered Modal Overlay for IP Review */}

      <AnimatePresence>
        {selectedIP && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIP(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 p-8 md:p-12 scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-10 sticky top-0 bg-white z-10 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Review Asset</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Verification Queue</p>
                </div>
                <button 
                  onClick={() => setSelectedIP(null)} 
                  className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl flex items-center justify-center transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-10">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Identity</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center group">
                        <span className="text-[10px] font-bold text-slate-400">Database ID</span>
                        <span className="text-[10px] font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">{selectedIP._id.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">Category</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-100">{selectedIP.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">Lead Owner</span>
                        <span className="text-[10px] font-black text-slate-900">{selectedIP.owner?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 relative z-10">Blockchain Status</p>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Database size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black truncate">
                          {selectedIP.txHash ? selectedIP.txHash : 'Awaiting Proof...'}
                        </p>
                        <p className="text-[9px] font-bold text-indigo-300">Hash Registry V1</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Invention Abstract</p>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h4 className="text-base font-black text-slate-900 mb-1 truncate">{selectedIP.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                      {selectedIP.description}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Document Proof</p>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IPFS Hash</p>
                      <p className="text-[10px] font-mono font-bold text-slate-900 truncate mb-2">{selectedIP.fileHash}</p>
                      {selectedIP.gridFsId || selectedIP.fileData || !selectedIP.fileHash?.startsWith('QmMock') ? (
                        <button
                          onClick={() => handleInspect(selectedIP)}
                          disabled={isFileLoading}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-all disabled:opacity-50"
                        >
                          {isFileLoading ? 'Loading File...' : <><Database size={12} /> Inspect Content</>}
                          <ExternalLink size={12} />
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100 flex items-center gap-2">
                          <AlertTriangle size={12} /> Mock Asset (No Content)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Feedback</label>
                    <textarea
                      placeholder="Add reviewer notes..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 min-h-[80px] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAction(selectedIP._id, 'Rejected')}
                      disabled={selectedIP.status !== 'Pending'}
                      className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(selectedIP._id, 'Approved')}
                      disabled={selectedIP.status !== 'Pending' || isProcessing}
                      className="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      {isProcessing ? 'Processing...' : selectedIP.status === 'Pending' ? 'Approve & Mint' : 'Already Processed'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
