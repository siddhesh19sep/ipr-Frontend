import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, AlertCircle, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '../services/api';

const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ ips: any[], disputes: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsLoading(true);
                setIsOpen(true);
                try {
                    const response = await globalSearch(query);
                    setResults(response.data);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults(null);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleNavigate = (type: 'IP' | 'Dispute', id: string) => {
        setIsOpen(false);
        setQuery('');
        if (type === 'IP') {
            navigate(`/ips/${id}`);
        } else {
            navigate(`/disputes`);
        }
    };

    return (
        <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
                    className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Search IPs or Disputes..."
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Searching global registry...</p>
                        </div>
                    ) : results && (results.ips.length > 0 || results.disputes.length > 0) ? (
                        <div className="max-h-[70vh] overflow-y-auto">
                            {results.ips.length > 0 && (
                                <div className="p-2 border-b border-slate-50">
                                    <h3 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intellectual Property</h3>
                                    {results.ips.map(ip => (
                                        <button
                                            key={ip.id}
                                            onClick={() => handleNavigate('IP', ip.id)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                        >
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate">{ip.title}</p>
                                                <p className="text-[10px] text-slate-500">Owner: {ip.owner || 'Unknown'}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">{ip.status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results.disputes.length > 0 && (
                                <div className="p-2">
                                    <h3 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Disputes</h3>
                                    {results.disputes.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => handleNavigate('Dispute', d.id)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                        >
                                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                                <AlertCircle size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate">{d.title}</p>
                                                <p className="text-[10px] text-slate-500">Claimant: {d.filedBy || 'Unknown'}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 uppercase">{d.status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50/50">
                            <p className="text-sm text-slate-500 font-medium">No results found for "{query}"</p>
                            <p className="text-[10px] text-slate-400 mt-1">Try searching for a different title or Registration ID.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
