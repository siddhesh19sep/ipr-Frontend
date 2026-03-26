import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { renewIP, transferOwnership } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, ShieldCheck, CheckCircle, Clock, Hash, Calendar, User, Users, Tag, Gavel, ExternalLink, Download, IndianRupee, Hourglass, Trash2, Key, ShoppingCart, Edit3, Save, X, ArrowLeftRight, AlertTriangle, Mail } from 'lucide-react';


interface IPDetail {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    fileHash: string;
    fileData?: string;
    gridFsId?: string;
    hasLegacyFile?: boolean;
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
    creators?: Array<{
        user: {
            _id: string;
            name: string;
            email: string;
            walletAddress?: string;
        };
        share: number;
    }>;

    isAvailableForLicense?: boolean;
    licensePrice?: number;
    licenseType?: string;
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

    // Download & View State
    const [isDownloading, setIsDownloading] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    // Licensing State
    const [isEditingLicense, setIsEditingLicense] = useState(false);
    const [licenseForm, setLicenseForm] = useState({
        isAvailableForLicense: false,
        licensePrice: 0,
        licenseType: 'Non-Exclusive'
    });
    const [isUpdatingLicense, setIsUpdatingLicense] = useState(false);
    const [isUpdatingProof, setIsUpdatingProof] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isRenewing, setIsRenewing] = useState(false);
    const [userLicense, setUserLicense] = useState<any>(null);

    // Transfer State
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferEmail, setTransferEmail] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    useEffect(() => {
        const fetchIpDetail = async () => {
            try {
                const res = await api.get(`/ip/${id}`);
                setIp(res.data.ip || res.data);
                setLicenseForm({
                    isAvailableForLicense: res.data.isAvailableForLicense || false,
                    licensePrice: res.data.licensePrice || 0,
                    licenseType: res.data.licenseType || 'Non-Exclusive'
                });
                
                // Also fetch if user has a license
                if (user) {
                    try {
                        const licenseRes = await api.get('/licenses/my-licenses');
                        const activeLicense = licenseRes.data.find((l: any) => l.ipId?._id === id && l.status === 'Active');
                        setUserLicense(activeLicense);
                    } catch (e) {
                        console.error("Failed to fetch licenses", e);
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load IP details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchIpDetail();
    }, [id, user]);

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

    const handleUpdateLicenseSettings = async () => {
        if (!ip) return;
        setIsUpdatingLicense(true);
        try {
            const res = await api.put(`/ip/${ip._id}`, licenseForm);
            const updated = res.data.ip || res.data;
            setIp(updated);
            setIsEditingLicense(false);
            alert("Licensing settings updated successfully!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update licensing settings.");
        } finally {
            setIsUpdatingLicense(false);
        }
    };

    const handleUpdateProof = async () => {
        if (!ip || !proofFile) return;
        setIsUpdatingProof(true);
        try {
            const fileContent = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(proofFile);
            });

            const res = await api.put(`/ip/${ip._id}`, { fileContent });
            const updated = res.data.ip || res.data;
            setIp(updated);
            setProofFile(null);
            alert("Document proof updated successfully! You can now inspect the file.");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update document proof.");
        } finally {
            setIsUpdatingProof(false);
        }
    };

    const handlePurchaseLicense = async () => {
        if (!window.confirm(`Are you sure you want to purchase a 1-year license for ₹${ip?.licensePrice}?`)) return;

        setIsPurchasing(true);
        try {
            await api.post('/licenses/purchase', {
                ipId: id,
                licenseType: ip?.licenseType,
                durationYears: 1
            });
            alert("License mapping successful! You now have authorized access.");
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || "Purchase failed.");
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleViewDocument = async () => {
        if (!ip) return;
        setIsViewing(true);
        try {
            let content = ip.fileData;

            if (!content || content === 'LARGE_FILE_STORED_IN_GRIDFS') {
                const fileRes = await api.get(`/ip/${id}/file`);
                content = fileRes.data.fileData;
            }

            if (content) {
                if (content.startsWith("data:")) {
                    const arr = content.split(',');
                    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while(n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const blob = new Blob([u8arr], {type: mime});
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                } else {
                    window.open(content, '_blank');
                }
            } else if (ip.fileHash && !ip.fileHash.startsWith('QmMock') && !ip.fileHash.startsWith('QmRestored')) {
                window.open(`https://gateway.pinata.cloud/ipfs/${ip.fileHash}`, '_blank');
            } else {
                alert('Migration Alert: No document content found on server. Please use the "Restore Proof" tool below to re-upload the original document.');
            }
        } catch (error: any) {
            console.error('Failed to view document:', error);
            if (error.response && error.response.status === 403) {
                alert("Access Denied: You must be the original owner or hold an active license to view this document.");
            } else {
                alert('Failed to fetch document. Please check your connection.');
            }
        } finally {
            setIsViewing(false);
        }
    };

    const handleDownloadDocument = async () => {
        if (!ip) return;
        const targetContent = ip.fileData;
        const targetHash = ip.fileHash;

        setIsDownloading(true);
        try {
            let content = targetContent;

            // MUST ALWAYS FETCH missing or large file data from backend first
            if (!content || content === 'LARGE_FILE_STORED_IN_GRIDFS') {
                try {
                    const fileRes = await api.get(`/ip/${id}/file`);
                    content = fileRes.data.fileData;
                } catch (e: any) {
                    if (e.response && e.response.status === 403) {
                        alert("Access Denied: You must be the original owner or hold an active license to download this document.");
                        setIsDownloading(false);
                        return;
                    }
                    console.error("Failed to lazy-load file content", e);
                }
            }

            // Only attempt external fetch if it's NOT a mock, NOT restored, and we STILL don't have local data
            if (!content && targetHash && !targetHash.startsWith('QmMock') && !targetHash.startsWith('QmRestored')) {
                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${targetHash}`);
                if (!response.ok) throw new Error("Gateway responded with error");
                // Note: Assuming the gateway returns the file content directly for non-mocks
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${ip.title.replace(/\s+/g, '_')}_IPR_Document`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                return;
            }

            if (content) {
                const link = document.createElement('a');
                link.href = content;
                
                // Extract file extension from data URI if possible
                let extension = "";
                if (content.startsWith("data:")) {
                    const mimeType = content.split(';')[0].split(':')[1];
                    if (mimeType === 'application/pdf') extension = ".pdf";
                    else if (mimeType === 'image/jpeg') extension = ".jpg";
                    else if (mimeType === 'image/png') extension = ".png";
                    else if (mimeType === 'text/plain') extension = ".txt";
                    else if (mimeType.includes('/')) extension = "." + mimeType.split('/')[1];
                }
                
                link.download = `${ip.title.replace(/\s+/g, '_')}_IPR_Document${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('Migration Alert: No document content found on server. Please use the "Restore Proof" tool below to re-upload the original document.');
            }
        } catch (error) {
            console.error('Failed to download document:', error);
            alert('Failed to fetch document from the IPFS gateway. Please check your connection.');
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

    const handleRenewIP = async () => {
        if (!window.confirm("Renewing this asset for 1 year costs ₹1,000. Proceed?")) return;
        
        setIsRenewing(true);
        try {
            const response = await renewIP(id!, { durationYears: 1 });
            setIp(response.data.ip);
            alert("Asset renewed successfully for another year!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Renewal failed.");
        } finally {
            setIsRenewing(false);
        }
    };

    const handleTransferOwnership = async () => {
        if (!transferEmail.trim()) {
            alert("Please enter the new owner's email address.");
            return;
        }

        if (!window.confirm(`Are you absolutely sure you want to transfer ownership of "${ip?.title}" to ${transferEmail}? You will lose all control over this asset.`)) return;

        setIsTransferring(true);
        try {
            await transferOwnership(id!, { newOwnerEmail: transferEmail });
            alert("Ownership transferred successfully!");
            navigate('/ips');
        } catch (err: any) {
            alert(err.response?.data?.message || "Transfer failed.");
        } finally {
            setIsTransferring(false);
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
                        {/* Transfer Button (Owner only) */}
                        {user && user.id === ip.owner._id && ip.status === 'Approved' && (
                            <button
                                onClick={() => setShowTransferModal(true)}
                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors border border-indigo-100 shadow-sm"
                            >
                                <ArrowLeftRight size={18} />
                                Transfer Ownership
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
                            
                            {ip.creators && ip.creators.length > 1 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <dt className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-1.5">
                                        <Users size={12} className="text-indigo-400" /> Co-Creators Split
                                    </dt>
                                    <div className="space-y-2">
                                        {ip.creators.map((c, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-600 font-medium truncate max-w-[120px]" title={c.user.email}>
                                                    {c.user.name} {c.user._id === ip.owner._id && <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded ml-1">PRIMARY</span>}
                                                </span>
                                                <span className="font-bold text-gray-900">{c.share}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                    <dd className="flex flex-col items-start gap-1">
                                        <span className="font-medium text-gray-900">
                                            {ip.expirationDate ? new Date(ip.expirationDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                        {user?.id === ip.owner._id && (
                                            <button 
                                                onClick={handleRenewIP}
                                                disabled={isRenewing}
                                                className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                                            >
                                                {isRenewing ? 'Renewing...' : 'Renew Now'}
                                            </button>
                                        )}
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

                    {/* Licensing & Commercialization Section */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Key className="text-indigo-600" /> Licensing & Commercialization
                            </h4>
                            {user?.id === ip.owner._id && !isEditingLicense && (
                                <button
                                    onClick={() => setIsEditingLicense(true)}
                                    className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1"
                                >
                                    <Edit3 size={16} /> Edit Settings
                                </button>
                            )}
                        </div>

                        {isEditingLicense ? (
                            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">Available for Licensing</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={licenseForm.isAvailableForLicense}
                                            onChange={(e) => setLicenseForm({ ...licenseForm, isAvailableForLicense: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Price (₹)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={licenseForm.licensePrice}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setLicenseForm({ ...licenseForm, licensePrice: val === '' ? 0 : parseInt(val, 10) });
                                            }}
                                            className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="Enter amount (₹)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">License Type</label>
                                        <select
                                            value={licenseForm.licenseType}
                                            onChange={(e) => setLicenseForm({ ...licenseForm, licenseType: e.target.value })}
                                            className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="Non-Exclusive">Non-Exclusive</option>
                                            <option value="Exclusive">Exclusive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleUpdateLicenseSettings}
                                        disabled={isUpdatingLicense}
                                        className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isUpdatingLicense ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                                    </button>
                                    <button
                                        onClick={() => setIsEditingLicense(false)}
                                        className="px-4 bg-slate-100 text-slate-600 font-bold py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Availability</p>
                                    <div className="flex items-center gap-2">
                                        {ip.isAvailableForLicense ? (
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                                <CheckCircle size={20} /> Currently Available
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 font-bold">
                                                <X size={20} /> Not for License
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {ip.isAvailableForLicense
                                            ? "This asset can be licensed for commercial or personal use according to the terms below."
                                            : "The owner has not opened this asset for licensing at this time."}
                                    </p>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Licensing Tiers</p>
                                        <div className="flex items-end gap-1 mb-1">
                                            <span className="text-2xl font-black text-slate-900">₹{ip.licensePrice?.toLocaleString()}</span>
                                            <span className="text-xs text-slate-500 font-medium pb-1">/ year</span>
                                        </div>
                                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100">
                                            {ip.licenseType || 'Non-Exclusive'} Use
                                        </span>
                                    </div>

                                    {user?.id !== ip.owner._id && ip.isAvailableForLicense && (
                                        <div className="mt-4">
                                            {userLicense ? (
                                                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2 border border-emerald-100">
                                                    <ShieldCheck size={16} /> You have an Active License
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handlePurchaseLicense}
                                                    disabled={isPurchasing}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                                                >
                                                    <ShoppingCart size={18} />
                                                    {isPurchasing ? 'Processing...' : 'Purchase 12-Month License'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                                    {ip.gridFsId || ip.hasLegacyFile || !ip.fileHash?.startsWith('QmMock') ? (
                                        <button
                                            onClick={handleViewDocument}
                                            disabled={isViewing}
                                            className="w-full bg-white border text-center border-green-200 rounded p-3 font-mono text-sm text-green-800 break-all shadow-inner hover:bg-green-100 transition-colors flex items-center justify-between"
                                            title="View Document Content in Browser"
                                        >
                                            <span>{isViewing ? 'Decrypting...' : ip.fileHash}</span>
                                            <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="bg-amber-50 border border-amber-100 rounded p-3 font-mono text-xs text-amber-700 break-all shadow-inner flex items-center gap-2">
                                                <AlertTriangle size={14} /> Migration Alert: Original document not found. This is a legacy registration.
                                            </div>
                                            {user?.id === ip.owner._id && (
                                                <div className="bg-white border-2 border-dashed border-amber-200 rounded-lg p-4 text-center">
                                                    <p className="text-[10px] font-bold text-amber-600 mb-2 uppercase tracking-wider">Owner Action Required: Restore Proof</p>
                                                    <input 
                                                        type="file" 
                                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                                        className="text-[10px] text-slate-500 mb-2 block mx-auto"
                                                        accept=".pdf,.doc,.docx,.txt"
                                                    />
                                                    <button
                                                        onClick={handleUpdateProof}
                                                        disabled={isUpdatingProof || !proofFile}
                                                        className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${(!proofFile || isUpdatingProof) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isUpdatingProof ? 'Synchronizing...' : <><Save size={16} /> Link Original Document to Registry</>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

            {/* Transfer Ownership Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden border border-slate-100">
                        {/* Background Decor */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                        
                        <button
                            onClick={() => setShowTransferModal(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 p-2 rounded-xl transition-all"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <ArrowLeftRight size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Transfer IP Ownership</h3>
                                <p className="text-xs text-slate-500 font-medium">Permanently transfer {ip.title} to another user</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 mt-0.5" size={18} />
                                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                                    CAUTION: This action is irreversible. Once the transfer is complete, you will lose all control and ownership of this intellectual property.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Recipient Identity (Email)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={transferEmail}
                                        onChange={(e) => setTransferEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                        placeholder="Enter registered user email..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleTransferOwnership}
                                    disabled={isTransferring || !transferEmail}
                                    className="w-full bg-indigo-600 text-white font-black rounded-2xl py-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                                >
                                    {isTransferring ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processing Blockchain TX...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={20} className="group-hover:rotate-12 transition-transform" />
                                            <span>Execute Ownership Transfer</span>
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setShowTransferModal(false)}
                                    className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors"
                                >
                                    Cancel & Return to Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IPDetail;
