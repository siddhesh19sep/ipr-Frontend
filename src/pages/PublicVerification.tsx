import React, { useState } from 'react';
import { Search, ShieldCheck, FileText, CheckCircle2, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VerificationResult {
    title: string;
    description: string;
    category: string;
    ownerName: string;
    registrationDate: string;
    expirationDate: string;
    txHash: string;
    fileHash: string;
    status: string;
}

const PublicVerification: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            setError("Please enter a Registration ID or Hash.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Note: This API call relies on the standard fetch because we don't want to use the authenticated `api.ts` instance
            const response = await fetch(`https://ipr-backend-u4al.onrender.com/api/ip/public/verify/${searchQuery}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Verification failed. IP not found.");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || "An error occurred while verifying the IP.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
            
            {/* Minimal Public Navigation */}
            <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">IPR Blockchain</span>
                            </Link>
                        </div>
                        <div className="flex space-x-4">
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Sign In</Link>
                            <Link to="/register" className="text-sm font-medium bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 shadow-sm">Get Started</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                
                {/* Background Decorators */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
                    
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-3xl mb-2 border border-indigo-500/20 relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                            <ShieldCheck className="h-12 w-12 text-indigo-400 relative z-10" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Public IP Verification</h1>
                        <p className="text-lg text-slate-400 max-w-xl mx-auto">
                            Instantly authenticate any Intellectual Property registered on our blockchain. Paste the Registration ID or Blockchain Hash below.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                        <div className="relative flex items-center group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-32 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner backdrop-blur-sm"
                                placeholder="Enter Reg ID (e.g. 64a7b...) or TxHash (0x...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : "Verify"}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2 fade-in">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}
                    </form>

                    {/* Result Card */}
                    {result && (
                        <div className="mt-12 text-left animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="bg-slate-800/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                                
                                {/* Emerald Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700"></div>

                                <div className="flex items-start justify-between relative z-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wide rounded-full border border-emerald-500/20 mb-4">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Authentic & Verified
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2 pr-12">{result.title}</h2>
                                        <div className="flex items-center gap-2 text-slate-400 mb-6 font-medium bg-slate-900/50 w-fit px-3 py-1.5 rounded-lg border border-slate-700/50">
                                            <span className="text-slate-500 text-sm">Owned by:</span>
                                            <span className="text-indigo-300">{result.ownerName}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Large Seal */}
                                    <div className="hidden sm:flex flex-col items-center justify-center absolute top-4 right-4 opacity-10">
                                        <ShieldCheck className="h-24 w-24 text-emerald-500" />
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700 relative z-10">
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6 italic border-l-2 border-indigo-500/30 pl-4">
                                        "{result.description}"
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                            <span className="text-xs text-slate-500 font-bold uppercase">Registration Date</span>
                                            <span className="text-sm text-slate-200 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                {new Date(result.registrationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                            <span className="text-xs text-slate-500 font-bold uppercase">Category</span>
                                            <span className="text-sm text-slate-200 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                {result.category}
                                            </span>
                                        </div>
                                    </div>

                                    {result.txHash && (
                                        <div className="mt-4 p-3 bg-indigo-900/20 rounded-xl border border-indigo-500/20">
                                            <span className="text-xs text-indigo-400/70 font-bold uppercase mb-1 block">Blockchain Transaction Hash</span>
                                            <a 
                                                href={`https://amoy.polygonscan.com/tx/${result.txHash}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-indigo-300 hover:text-indigo-200 font-mono break-all flex items-center gap-2 group/link"
                                            >
                                                {result.txHash}
                                                <svg className="w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            {/* Simple Footer */}
            <footer className="py-6 border-t border-slate-800/50 text-center">
                <p className="text-xs text-slate-500 font-medium">© 2026 IPR Blockchain Project. Powered by standard compliance verification.</p>
            </footer>
        </div>
    );
};

// Simple AlertTriangle component for the error state since we didn't extract it directly above
function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export default PublicVerification;
