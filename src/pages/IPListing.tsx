import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Shield, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

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
}

const IPListing: React.FC = () => {
    const [ips, setIps] = useState<IPItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        const fetchIps = async () => {
            try {
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

    const filteredIps = ips.filter(ip => {
        const matchesSearch = ip.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? ip.category === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow-sm">
                <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-indigo-600" />
                    Intellectual Property Registry
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    A verifiable ledger of all registered intellectual properties on the network.
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
                <div className="relative w-full sm:w-64">
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
                                <Link to={`/ips/${ip._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    View Details &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IPListing;
