import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

interface IP {
    _id: string;
    title: string;
    category: string;
    owner: {
        _id: string;
        name: string;
    };
}

export default function FileDispute() {
    const navigate = useNavigate();
    const [ips, setIps] = useState<IP[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedIpId, setSelectedIpId] = useState('');
    const [evidence, setEvidence] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchIps = async () => {
            try {
                const res = await api.get('/ip/all');
                setIps(res.data);
            } catch (err) {
                console.error("Failed to load IPs", err);
            }
        };
        fetchIps();
    }, []);

    const filteredIps = ips.filter(ip =>
        ip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ip._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedIpId) {
            setError('Please select an IP to dispute.');
            return;
        }
        if (!evidence.trim()) {
            setError('Please provide evidence or reasoning for your dispute.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/disputes/create', {
                ipId: selectedIpId,
                evidence
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to file dispute.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Dispute Filed Successfully</h2>
                <p className="text-slate-500">Your claim has been submitted to the Admin team for review.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Gavel className="text-rose-600" size={32} /> File a Dispute
                </h1>
                <p className="text-slate-500 mt-2">Lodge a formal claim against an existing registered Intellectual Property.</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm font-semibold">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">1. Select Target IP</label>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search IP by title or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                            />
                        </div>

                        <div className="h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-2">
                            {filteredIps.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-4">No IPs found.</p>
                            ) : (
                                filteredIps.map(ip => (
                                    <div
                                        key={ip._id}
                                        onClick={() => setSelectedIpId(ip._id)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedIpId === ip._id ? 'border-rose-500 bg-rose-50' : 'border-transparent hover:bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm text-slate-900">{ip.title}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Owner: {ip.owner?.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-1 block">ID: {ip._id}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">2. Dispute Evidence & Reasoning</label>
                        <p className="text-xs text-slate-500 leading-relaxed">Clearly state why you are disputing this IP. Include links to prior art, patent numbers, or timestamps of original creation.</p>
                        <textarea
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm leading-relaxed"
                            placeholder="I am disputing this property because..."
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Submitting Claim...' : 'File Official Dispute'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
