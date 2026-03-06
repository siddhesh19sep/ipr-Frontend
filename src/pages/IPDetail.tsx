import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, ShieldCheck, CheckCircle, Clock, Hash, Calendar, User, Tag, Gavel, ExternalLink, Download, IndianRupee, Hourglass, Trash2 } from 'lucide-react';

interface IPDetail {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    fileHash: string;
    txHash?: string;
    registrationCost?: number;
    expirationDate?: string;
    createdAt: string;
    updatedAt: string;
    owner: {
        _id: string;
        name: string;
        email: string;
        walletAddress?: string;
    };
}

const IPDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [ip, setIp] = useState<IPDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Dispute Modal State
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [disputeEvidence, setDisputeEvidence] = useState('');
    const [isFilingDispute, setIsFilingDispute] = useState(false);

    // Download State
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchIpDetail = async () => {
            try {
                const response = await api.get(`/ip/${id}`);
                setIp(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load IP details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchIpDetail();
    }, [id]);

    const handleFileDispute = async () => {
        if (!disputeEvidence.trim()) {
            alert("Please provide evidence for your dispute.");
            return;
        }

        setIsFilingDispute(true);
        try {
            await api.post('/disputes/create', {
                ipId: id,
                evidence: disputeEvidence
            });
            alert("Dispute filed successfully! Admins will review the case.");
            setShowDisputeModal(false);
            setDisputeEvidence('');
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to file dispute.");
        } finally {
            setIsFilingDispute(false);
        }
    };

    const handleDownloadDocument = async () => {
        if (!ip?.fileHash) return;

        setIsDownloading(true);
        try {
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ip.fileHash}`);
            const data = await response.json();

            if (data.fileContent) {
                const link = document.createElement('a');
                link.href = data.fileContent;
                link.download = `${ip.title.replace(/\s+/g, '_')}_IPR_Document`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('No document data found in IPFS metadata.');
            }
        } catch (error) {
            console.error('Failed to download document:', error);
            alert('Failed to fetch document from IPFS network.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteIP = async () => {
        if (window.confirm("Are you sure you want to permanently delete this IP registration? This cannot be undone.")) {
            setIsDeleting(true);
            try {
                await api.delete(`/ip/${id}`);
                navigate('/dashboard');
            } catch (err: any) {
                alert(err.response?.data?.message || err.response?.data?.error || "Failed to delete IP");
                setIsDeleting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !ip) {
        return (
            <div className="bg-red-50 p-6 rounded-lg text-center">
                <p className="text-red-700 font-medium text-lg">{error || 'IP not found'}</p>
                <Link to="/ips" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Registry
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center text-sm">
                <Link to="/ips" className="text-gray-500 hover:text-gray-700 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Registry
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-8 border-b border-gray-200 bg-gray-50/50 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                <Tag className="h-4 w-4 mr-1.5" /> {ip.category}
                            </span>

                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ip.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                ip.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {ip.status === 'Approved' ? <CheckCircle className="h-4 w-4 mr-1.5" /> : <Clock className="h-4 w-4 mr-1.5" />}
                                {ip.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{ip.title}</h1>
                    </div>
                    {/* File Dispute Button (Only if the user is NOT the owner) */}
                    <div className="flex items-center gap-3">
                        {user && user.id !== ip.owner._id && (
                            <button
                                onClick={() => setShowDisputeModal(true)}
                                className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors border border-rose-100 shadow-sm"
                            >
                                <Gavel size={18} />
                                File Dispute
                            </button>
                        )}
                        {/* Delete Button (If the user IS the owner or Admin) */}
                        {user && (user.id === ip.owner._id || user.role === 'Admin') && (
                            <button
                                onClick={handleDeleteIP}
                                disabled={isDeleting}
                                className={`text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors border border-transparent hover:border-red-100 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Trash2 size={18} />
                                {isDeleting ? 'Deleting...' : 'Delete IP'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="px-6 py-6 space-y-8">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Abstract / Description</h3>
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-100">
                            {ip.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border text-gray-600 rounded-lg p-5 shadow-sm">
                            <h4 className="flex items-center font-bold text-gray-900 mb-4 border-b pb-2">
                                <User className="h-5 w-5 mr-2 text-indigo-500" />
                                Ownership Verification
                            </h4>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500 font-medium">Owner Name</dt>
                                    <dd className="font-semibold text-gray-900">{ip.owner.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500 font-medium">Contact Email</dt>
                                    <dd className="text-gray-900">{ip.owner.email}</dd>
                                </div>
                                {ip.owner.walletAddress && (
                                    <div>
                                        <dt className="text-gray-500 font-medium">Web3 Wallet</dt>
                                        <dd className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                                            {ip.owner.walletAddress}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="bg-white border text-gray-600 rounded-lg p-5 shadow-sm">
                            <h4 className="flex items-center font-bold text-gray-900 mb-4 border-b pb-2">
                                <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                                Registration Details
                            </h4>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500 font-medium">Date Registered</dt>
                                    <dd className="font-medium text-gray-900">{new Date(ip.createdAt).toLocaleString()}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500 font-medium">Last Updated</dt>
                                    <dd className="font-medium text-gray-900">{new Date(ip.updatedAt).toLocaleString()}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500 font-medium">Internal ID</dt>
                                    <dd className="font-mono text-xs mt-1">{ip._id}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-white border text-gray-600 rounded-lg p-5 shadow-sm">
                            <h4 className="flex items-center font-bold text-gray-900 mb-4 border-b pb-2">
                                <Hourglass className="h-5 w-5 mr-2 text-indigo-500" />
                                Validity & Financials
                            </h4>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500 font-medium flex items-center gap-1.5"><IndianRupee size={14} /> Registration Cost</dt>
                                    <dd className="font-medium text-gray-900">
                                        {ip.registrationCost ? `₹${ip.registrationCost.toLocaleString()}` : 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500 font-medium">Expiration Threshold</dt>
                                    <dd className="font-medium text-gray-900">
                                        {ip.expirationDate ? new Date(ip.expirationDate).toLocaleDateString() : 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500 font-medium">Current Status</dt>
                                    <dd className="mt-1">
                                        {ip.expirationDate && new Date() > new Date(ip.expirationDate) ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Expired</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Valid & Active</span>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-start gap-4">
                        <ShieldCheck className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                        <div className="w-full">
                            <h4 className="text-lg font-bold text-green-900 mb-1 flex items-center gap-2">
                                {ip.fileHash?.startsWith('Qm') || ip.fileHash?.startsWith('b') ? 'Decentralized IPFS Hash' : 'Legacy Cryptographic Hash'} <Hash className="h-4 w-4" />
                            </h4>
                            <p className="text-sm text-green-700 mb-3">
                                {ip.fileHash?.startsWith('Qm') || ip.fileHash?.startsWith('b') ?
                                    'This document is stored permanently on the InterPlanetary File System (IPFS) network. The CID string below is both its fingerprint and its decentralized address.' :
                                    'This document was secured using a local SHA-256 fingerprint before the IPFS upgrade.'}
                            </p>

                            {ip.fileHash?.startsWith('Qm') || ip.fileHash?.startsWith('b') ? (
                                <div className="space-y-2">
                                    <a
                                        href={`https://gateway.pinata.cloud/ipfs/${ip.fileHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white border text-center border-green-200 rounded p-3 font-mono text-sm text-green-800 break-all shadow-inner hover:bg-green-100 transition-colors flex items-center justify-between"
                                        title="View Raw IPFS Metadata"
                                    >
                                        <span>{ip.fileHash}</span>
                                        <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                                    </a>
                                    <button
                                        onClick={handleDownloadDocument}
                                        disabled={isDownloading}
                                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <Download size={18} />
                                        {isDownloading ? 'Decrypting & Downloading...' : 'Download Original Document'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white border text-center border-green-200 rounded p-3 font-mono text-sm text-green-800 break-all shadow-inner">
                                    {ip.fileHash}
                                </div>
                            )}
                        </div>
                    </div>

                    {ip.txHash && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 flex items-start gap-4">
                            <ShieldCheck className="h-8 w-8 text-indigo-600 flex-shrink-0 mt-1" />
                            <div className="w-full">
                                <h4 className="text-lg font-bold text-indigo-900 mb-1 flex items-center gap-2">
                                    Blockchain Transaction
                                </h4>
                                <p className="text-sm text-indigo-700 mb-3">
                                    This IP Hash is permanently secured on the blockchain network. You can use the transaction hash below to verify it on a block explorer.
                                </p>
                                <div className="bg-white border border-indigo-200 rounded p-3 font-mono text-sm text-indigo-800 break-all select-all shadow-inner">
                                    {ip.txHash}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Dispute Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowDisputeModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                <Gavel size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">File a Dispute</h3>
                                <p className="text-xs text-slate-500">Claim ownership or report infringement</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Evidence & Justification</label>
                                <textarea
                                    value={disputeEvidence}
                                    onChange={(e) => setDisputeEvidence(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-3 h-32 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
                                    placeholder="Provide detailed evidence on why this IP registration is invalid or belongs to you..."
                                />
                            </div>

                            <button
                                onClick={handleFileDispute}
                                disabled={isFilingDispute}
                                className="w-full bg-rose-600 text-white font-bold rounded-xl py-3 hover:bg-rose-700 transition-colors disabled:opacity-50"
                            >
                                {isFilingDispute ? 'Submitting...' : 'Submit Dispute Claim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IPDetail;
