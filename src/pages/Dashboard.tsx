import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, Activity } from 'lucide-react';

interface IPItem {
    _id: string;
    title: string;
    status: string;
    category: string;
    createdAt: string;
}

const Dashboard: React.FC = () => {
    const [ips, setIps] = useState<IPItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchIps = async () => {
            try {
                const response = await api.get('/ip/all');
                // If we want to show only user's IPs, we could filter here or have a dedicated endpoint.
                // Assuming /ip/all returns all, we filter on frontend for simplicity in this demo.
                const userIps = response.data; // Ideally: response.data.filter(ip => ip.owner._id === user?.id)
                setIps(userIps);
            } catch (error) {
                console.error("Failed to fetch IPs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchIps();
    }, []);

    const stats = {
        total: ips.length,
        pending: ips.filter((ip) => ip.status === 'Pending').length,
        approved: ips.filter((ip) => ip.status === 'Approved').length,
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back{user?.name ? `, ${user.name}` : ''}</h1>
                <Link
                    to="/register-ip"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <FileText className="mr-2 h-4 w-4" />
                    New Registration
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Activity className="h-6 w-6 text-indigo-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total IP Assets</dt>
                                    <dd className="text-3xl font-semibold text-gray-900">{stats.total}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                                    <dd className="text-3xl font-semibold text-gray-900">{stats.pending}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Approved Assets</dt>
                                    <dd className="text-3xl font-semibold text-gray-900">{stats.approved}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Registrations</h3>
                    <Link to="/ips" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                        View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    {ips.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No IP assets</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by registering your first IP.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ips.slice(0, 5).map((ip) => (
                                    <tr key={ip._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ip.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {ip.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ip.status === 'Approved' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="-ml-0.5 mr-1.5 h-3 w-3 text-green-400" /> Approved
                                                </span>
                                            )}
                                            {ip.status === 'Pending' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Clock className="-ml-0.5 mr-1.5 h-3 w-3 text-yellow-400" /> Pending
                                                </span>
                                            )}
                                            {ip.status === 'Rejected' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle className="-ml-0.5 mr-1.5 h-3 w-3 text-red-400" /> Rejected
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ip.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/ips/${ip._id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end">
                                                View Details <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
