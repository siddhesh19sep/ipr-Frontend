import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Shield, Clock, CheckCircle, XCircle, FileText, BarChart3, X, TrendingUp, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';


interface IPItem {
    _id: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
    owner: {
        _id: string;
        name: string;
    };
    isAvailableForLicense?: boolean;
}

const IPListing: React.FC = () => {
    const [ips, setIps] = useState<IPItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedIpAnalytics, setSelectedIpAnalytics] = useState<IPItem | null>(null);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);


    useEffect(() => {
        const fetchIps = async () => {
            try {
                // Fetch ALL IPs instead of just marketplace
                const response = await api.get('/ip/all');
                setIps(response.data);
            } catch (error) {
                console.error("Failed to fetch IPs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchIps();
    }, []);

    const fetchAnalytics = async (ip: IPItem) => {
        setIsAnalyticsLoading(true);
        setSelectedIpAnalytics(ip);
        try {
            const response = await api.get(`/dashboard/analytics/${ip._id}`);
            setAnalyticsData(response.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setIsAnalyticsLoading(false);
        }
    };


    const filteredIps = ips.filter(ip => {
        const matchesSearch = ip.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? ip.category === filterCategory : true;
        const matchesStatus = filterStatus ? ip.status === filterStatus : true;
        return matchesSearch && matchesCategory && matchesStatus;
    });


    return (
        <div className="space-y-6">
            <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow-sm">
                <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-indigo-600" />
                    License Marketplace
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Browse globally registered intellectual properties securely available for commercial licensing.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border bg-white"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Patent">Patent</option>
                        <option value="Trademark">Trademark</option>
                        <option value="Copyright">Copyright</option>
                        <option value="Trade Secret">Trade Secret</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="relative w-full sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>



            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredIps.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm text-center py-16">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No IPs found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredIps.map((ip) => (
                        <div key={ip._id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                                        {ip.category}
                                    </span>

                                    {ip.status === 'Approved' && (
                                        <span className="inline-flex items-center text-xs font-medium text-green-600">
                                            <CheckCircle className="mr-1 h-4 w-4" /> Approved
                                        </span>
                                    )}
                                    {ip.status === 'Pending' && (
                                        <span className="inline-flex items-center text-xs font-medium text-yellow-600">
                                            <Clock className="mr-1 h-4 w-4" /> Pending
                                        </span>
                                    )}
                                    {ip.status === 'Rejected' && (
                                        <span className="inline-flex items-center text-xs font-medium text-red-600">
                                            <XCircle className="mr-1 h-4 w-4" /> Rejected
                                        </span>
                                    )}
                                    {ip.isAvailableForLicense && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-600 text-white ml-2">
                                            Licensing Available
                                        </span>
                                    )}
                                </div>

                                <Link to={`/ips/${ip._id}`} className="block mt-2">
                                    <p className="text-xl font-bold text-gray-900 truncate">{ip.title}</p>
                                    <p className="mt-1 text-sm text-gray-500 truncate">Owner: {ip.owner?.name}</p>
                                </Link>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-xs text-gray-500 flex items-center">
                                    Registered: {new Date(ip.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => fetchAnalytics(ip)}
                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="View Performance Graph"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                    </button>
                                    <Link to={`/ips/${ip._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Analytics Modal */}
            <AnimatePresence>
                {selectedIpAnalytics && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedIpAnalytics(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 border border-slate-100"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Asset Performance</h3>
                                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{selectedIpAnalytics.title}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedIpAnalytics(null)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="h-6 w-6 text-slate-400" />
                                    </button>
                                </div>

                                {isAnalyticsLoading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Royalty Earning</p>
                                                <h4 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                                                    <IndianRupee className="text-emerald-500" size={24} />
                                                    {analyticsData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Current Status</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                    selectedIpAnalytics.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                                                    selectedIpAnalytics.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {selectedIpAnalytics.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-64 mt-8">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={analyticsData}>
                                                    <defs>
                                                        <linearGradient id="colorRoyaltyAsset" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                                        itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                                    />
                                                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRoyaltyAsset)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default IPListing;
