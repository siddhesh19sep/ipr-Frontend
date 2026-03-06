import React, { useState } from 'react';
import { Upload, Shield, Info, CheckCircle, Database, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegisterIP() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Submitted!</h2>
          <p className="text-slate-600 mb-8">
            Your IP asset has been successfully timestamped on the blockchain. Our legal team will review the documentation within 24-48 hours.
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Blockchain Receipt</p>
            <p className="text-xs font-mono font-bold text-slate-900 break-all">0x8a2f3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s</p>
          </div>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
            Go to My Assets
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register New IP</h1>
        <p className="text-slate-500 text-sm">Protect your creation with immutable blockchain timestamping</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[
            { n: 1, label: 'Asset Details' },
            { n: 2, label: 'Documentation' },
            { n: 3, label: 'Blockchain Proof' }
          ].map((s) => (
            <div key={s.n} className={`flex-1 py-4 px-6 text-center border-r last:border-0 border-slate-100 flex items-center justify-center gap-3 ${
              step === s.n ? 'bg-indigo-50/50 text-indigo-600' : 'text-slate-400'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.n ? 'bg-indigo-600 text-white' : 'bg-slate-100'
              }`}>{s.n}</span>
              <span className="text-sm font-bold">{s.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">IP Title</label>
                  <input required type="text" placeholder="e.g. Neural Network Optimizer" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>Copyright</option>
                    <option>Trademark</option>
                    <option>Patent</option>
                    <option>Design</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea rows={4} placeholder="Describe your creation in detail..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3">
                <Info className="text-indigo-600 shrink-0" size={20} />
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Ensure the title and description accurately reflect your creation. This information will be permanently linked to your blockchain record.
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:border-indigo-400 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 transition-colors">
                  <Upload className="text-slate-400 group-hover:text-indigo-600" size={32} />
                </div>
                <p className="font-bold text-slate-900">Upload Documentation</p>
                <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG or ZIP (Max 50MB)</p>
                <button type="button" className="mt-6 text-sm font-bold text-indigo-600 hover:underline">Browse Files</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <FileText className="text-slate-400" size={20} />
                  <span className="text-xs font-medium text-slate-600">Proof of Creation.pdf</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <FileText className="text-slate-400" size={20} />
                  <span className="text-xs font-medium text-slate-600">Technical Specs.zip</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Database size={120} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="text-indigo-400" />
                    Blockchain Verification
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    By proceeding, you are authorizing the system to generate a unique SHA-256 hash of your documents and anchor it to the public ledger. This process is irreversible and provides legal proof of existence.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-indigo-500" />
                    </div>
                    <span className="text-xs font-bold text-indigo-400">Ready to Anchor</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between pt-8 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-8 py-3 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            {step < 3 ? (
              <button 
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                Continue
              </button>
            ) : (
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
              >
                {isSubmitting ? 'Anchoring to Blockchain...' : 'Confirm & Register'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
