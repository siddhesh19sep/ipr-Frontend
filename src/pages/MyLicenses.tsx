import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Key, Calendar, ExternalLink, ShieldCheck, Clock, ArrowRight, Tag } from 'lucide-react';

interface License {
    _id: string;
    ipId: {
        _id: string;
        title: string;
        category: string;
        fileHash: string;
    };
    licenseType: string;
    pricePaid: number;
    expiresAt: string;
    status: string;
    txId: string;
    createdAt: string;
}

const MyLicenses: React.FC = () => {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLicenses = async () => {
            try {
                const response = await api.get('/licenses/my-licenses');
                setLicenses(response.data);
            } catch (err: any) {
                setError('Failed to load your licenses. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLicenses();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Key className="text-indigo-600" size={32} /> My Licensed Assets
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your active intellectual property licenses and usage rights.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {licenses.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Licenses Found</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't purchased any asset licenses yet. Explore the registry to find content to license.</p>
                    <Link 
                        to="/ips" 
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        Browse IP Registry <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {licenses.map((license) => {
                        const isExpired = new Date(license.expiresAt) < new Date();
                        
                        return (
                            <div key={license._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                            {license.licenseType}
                                        </span>
                                        {isExpired ? (
                                            <span className="flex items-center gap-1 text-rose-600 text-xs font-bold">
                                                <Clock size={14} /> Expired
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                <ShieldCheck size={14} /> Active
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-1">{license.ipId?.title}</h3>
                                    
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                        <Tag size={14} /> {license.ipId?.category}
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-50">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-medium">Expires On</span>
                                            <span className="font-bold text-slate-700">{new Date(license.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-medium">License ID</span>
                                            <span className="font-mono text-[10px] text-slate-500">{license._id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                                    <Link 
                                        to={`/ips/${license.ipId?._id}`}
                                        className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-2 rounded-xl text-center text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        View Asset <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyLicenses;
