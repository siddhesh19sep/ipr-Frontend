import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, Type, List, Tag, Shield, IndianRupee, Calendar, CheckCircle2, AlertTriangle, Users, Plus, Trash2, ArrowUpRight, ShieldCheck, Activity, FilePlus } from 'lucide-react';

import { AuthContext } from '../context/AuthContext';
import { motion } from 'motion/react';

// Declare the Razorpay window object type for TypeScript
declare global {
    interface Window {
        Razorpay: any;
    }
}

const IPRegistration: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Patent');
    const [validityPeriod, setValidityPeriod] = useState<number | string>(5);
    const [file, setFile] = useState<File | null>(null);
    const [creators, setCreators] = useState([{ email: '', share: 100 }]);


    const [pricingMatrix, setPricingMatrix] = useState<Record<string, number>>({
        Patent: 750, Trademark: 850, Copyright: 35, 'Trade Secret': 50, Other: 100
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showMockPayment, setShowMockPayment] = useState(false);
    const [mockOrderData, setMockOrderData] = useState<any>(null);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    // AI Scanner States
    const [isScanning, setIsScanning] = useState(false);
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'clean' | 'plagiarized'>('idle');
    const [scanReport, setScanReport] = useState<any>(null);

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user && creators[0].email === '') {
            setCreators([{ email: user.email, share: 100 }]);
        }
    }, [user]);

    const [myIps, setMyIps] = useState<any[]>([]);
    const [isLoadingIps, setIsLoadingIps] = useState(true);

    useEffect(() => {
        const fetchMyIps = async () => {
            try {
                const res = await api.get('/dashboard/creator');
                if (res.data && res.data.recentAssets) {
                    setMyIps(res.data.recentAssets);
                }
            } catch (err) {
                console.error("Failed to load user IPs", err);
            } finally {
                setIsLoadingIps(false);
            }
        };
        fetchMyIps();
    }, []);


    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const res = await api.get('/settings/pricing');
                if (res.data) setPricingMatrix(res.data);
            } catch (err) {
                console.error("Failed to get live pricing matrix", err);
            }
        };

        fetchPricing();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const addCreator = () => {
        setCreators([...creators, { email: '', share: 0 }]);
    };

    const removeCreator = (index: number) => {
        const newCreators = creators.filter((_, i) => i !== index);
        setCreators(newCreators);
    };

    const updateCreator = (index: number, field: 'email' | 'share', value: string | number) => {
        const newCreators = [...creators];
        newCreators[index] = { ...newCreators[index], [field]: value };
        setCreators(newCreators);
    };

    const totalShare = creators.reduce((acc, curr) => acc + (Number(curr.share) || 0), 0);


    const getPricingDetails = () => {
        const baseCostPerYear = pricingMatrix[category] || 300;
        const years = typeof validityPeriod === 'number' ? validityPeriod : (parseInt(validityPeriod as string) || 1);
        return { cost: baseCostPerYear * years, years };
    };

    const { cost, years } = getPricingDetails();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !category || !validityPeriod || !description) {
            alert('Please fill in all text fields before registering.');
            setError('Please fill in all text fields before registering.');
            return;
        }

        if (!file) {
            alert('Please upload a document to register.');
            setError('Please upload a document (.pdf, .doc, .txt) to register.');
            return;
        }

        if (Math.round(totalShare) !== 100) {
            alert('Total creator shares must sum to 100%.');
            setError('Total creator shares must sum to 100%.');
            return;
        }

        if (creators.some(c => !c.email)) {
            alert('Please provide emails for all creators.');
            setError('Please provide emails for all creators.');
            return;
        }


        // Start AI Security Scan
        setError('');
        setIsScanning(true);
        setScanState('scanning');

        try {
            // Fake a beautiful 3-second minimum scan time for dramatic UX
            const scanPromise = api.post('/ip/scan', { title, description });
            const timerPromise = new Promise(resolve => setTimeout(resolve, 3000));
            
            const [scanRes] = await Promise.all([scanPromise, timerPromise]);
            
            if (!scanRes.data.isUnique) {
                setScanState('plagiarized');
                setScanReport(scanRes.data);
                // We keep the modal open to show the red error
                return;
            }
            
            setScanState('clean');
            // Wait 1.5 seconds on the green screen, then proceed to payment
            setTimeout(() => {
                setIsScanning(false);
                setScanState('idle');
                handlePaymentConfirm();
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setIsScanning(false);
            setScanState('idle');
            setError("Failed to run AI Security Scan. Please try again.");
        }
    };

    const handlePaymentConfirm = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            // 1. Create a Razorpay Order on the Backend
            const orderRes = await api.post('/payments/create-order', {
                amount: cost
            });
            const order = orderRes.data;

            // 2. Check if this is a mock order from the backend
            if (order.id && order.id.startsWith('order_mock_')) {
                // Show our custom Mock Payment overlay instead of bypassing silently
                console.log("Mock Order detected. Showing Custom Mock Payment UI.");
                setMockOrderData(order);
                setShowMockPayment(true);
                setIsSubmitting(false);
                return;
            }

            // 2b. Configure the Official Razorpay Checkout Widget (For real orders)
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholderkey",
                amount: order.amount,
                currency: order.currency,
                name: "Blockchain IPR",
                description: `IP Registration for ${years} years`,
                order_id: order.id,
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "UPI (GPay, Paytm, PhonePe)",
                                instruments: [
                                    { method: "upi" }
                                ]
                            },
                            cards: {
                                name: "Credit / Debit Cards",
                                instruments: [
                                    { method: "card" }
                                ]
                            },
                            wallets: {
                                name: "Digital Wallets",
                                instruments: [
                                    { method: "wallet" }
                                ]
                            },
                            netbanking: {
                                name: "Netbanking",
                                instruments: [
                                    { method: "netbanking" }
                                ]
                            }
                        },
                        sequence: ["block.upi", "block.cards", "block.wallets", "block.netbanking"],
                        preferences: { show_default_blocks: false }
                    }
                },
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment Signature securely on the Backend
                        await api.post('/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // 4. If verification passes, Read File and Submit the IP Registration
                        setIsSubmitting(true); // Keep spinner active during upload
                        const fileContent = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (event) => resolve(event.target?.result as string);
                            reader.onerror = (error) => reject(error);
                            reader.readAsDataURL(file);
                        });

                        await api.post('/ip/create', {
                            title,
                            description,
                            category,
                            fileContent,
                            validityPeriod: typeof validityPeriod === 'number' ? validityPeriod : (parseInt(validityPeriod as string) || 1),
                            creators
                        });


                        navigate('/dashboard');
                    } catch (verificationError: any) {
                        console.error("Payment Verification or Final Submission Failed:", verificationError);
                        setError(verificationError.response?.data?.error || "Payment was verified but registration failed.");
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: user?.name || "IP User",
                    email: user?.email || "user@example.com",
                },
                theme: {
                    color: "#4f46e5" // Indigo 600
                }
            };

            // 5. Open the Razorpay Window Overlay using the global window object
            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                console.error("Payment Failed:", response.error.description);
                setError(response.error.description || "The payment transaction failed.");
                setIsSubmitting(false);
            });

            rzp.open();

        } catch (err: any) {
            console.error("Payment Initiation Error:", err);
            alert("Payment Initiation Error: " + (err.response?.data?.error || err.message));
            setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to initiate secure checkout.');
            setIsSubmitting(false);
        }
    };

    const handleExecuteMockPayment = async () => {
        if (!mockOrderData) return;
        setIsSubmitting(true);
        setShowMockPayment(false);

        try {
            await api.post('/payments/verify-payment', {
                razorpay_order_id: mockOrderData.id,
                razorpay_payment_id: `pay_mock_${Math.floor(Math.random() * 100000)}`,
                razorpay_signature: "mock_signature_bypass"
            });

            // Read File and Submit the IP Registration
            const fileContent = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });

            await api.post('/ip/create', {
                title,
                description,
                category,
                fileContent,
                validityPeriod: typeof validityPeriod === 'number' ? validityPeriod : (parseInt(validityPeriod as string) || 1),
                creators
            });


            setIsSubmitting(false);
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Mock Final Submission Failed:", err);
            setError(err.response?.data?.error || "Mock Payment was verified but registration failed.");
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {showRegistrationForm ? (
            <div className="max-w-3xl border border-gray-200 bg-white rounded-xl shadow-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="px-6 py-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-indigo-600" /> Register Intellectual Property
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload your documents to secure them with a permanent SHA-256 hash on the platform.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowRegistrationForm(false)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-200"
                    >
                        Cancel
                    </button>
                </div>

            <div className="px-6 py-6">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IP Title</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Type className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                                placeholder="Unique Invention Name"

                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border bg-white"
                            >
                                <option value="Patent">Patent</option>
                                <option value="Trademark">Trademark</option>
                                <option value="Copyright">Copyright</option>
                                <option value="Trade Secret">Trade Secret</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validity Period (Years)</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={validityPeriod}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setValidityPeriod(val === '' ? '' : parseInt(val, 10));
                                }}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"
                                placeholder="Enter years (e.g. 5)"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 font-medium">
                            How many years should this registration cover?
                            <span className="text-indigo-600 ml-1">(Currently priced at ₹{(pricingMatrix[category] || 300).toLocaleString()} per year)</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Abstract</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                <List className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                                placeholder="Detailed description of your IP..."
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-600" />
                                Co-Creators & Royalty Split
                            </h3>
                            <button
                                type="button"
                                onClick={addCreator}
                                className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1 transition-colors"
                            >
                                <Plus size={14} /> Add Creator
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {creators.map((creator, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <div className="flex-1">
                                        <input
                                            type="email"
                                            value={creator.email}
                                            onChange={(e) => updateCreator(index, 'email', e.target.value)}
                                            placeholder="User Email"
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                            readOnly={index === 0 && creator.email === user?.email}
                                        />
                                    </div>
                                    <div className="w-24 relative">
                                        <input
                                            type="number"
                                            value={creator.share}
                                            onChange={(e) => updateCreator(index, 'share', e.target.value)}
                                            placeholder="%"
                                            className="w-full border border-slate-200 rounded-lg pl-3 pr-6 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <span className="absolute right-2 top-2 text-slate-400 text-sm">%</span>
                                    </div>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCreator(index)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Split</span>
                            <span className={`text-sm font-black ${totalShare === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {totalShare}%
                            </span>
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Document Upload</label>
                        <div className="mt-1 flex justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                            <div className="space-y-2 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex justify-center text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 p-1">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                                    </label>
                                    <p className="pl-1 pt-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOC, TXT up to 10MB</p>
                                {file && (
                                    <p className="text-sm font-medium text-indigo-600 mt-2 bg-indigo-50 py-1 px-3 rounded-full inline-block">Selected: {file.name}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> A secure SHA-256 hash will be generated from this document and stored permanently.
                        </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
                        <h4 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wider">Registration Assessment</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-md border border-indigo-50 shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg flex-shrink-0">
                                    <IndianRupee size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500 font-medium">Fiat Cost</p>
                                    <p className="font-bold text-slate-900 truncate">₹{cost.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-md border border-indigo-50 shadow-sm flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg flex-shrink-0">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Period of Validity</p>
                                    <p className="font-bold text-slate-900">{years} Years</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing & Hashing...
                                </span>
                            ) : (
                                'Secure & Register IP'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            </div>
            ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full animate-in fade-in zoom-in-95 duration-300">
                {/* My Registered IPs Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">My Registered IPs</h3>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                <Activity size={12} className="animate-pulse" /> Live Blockchain Ledger
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/ips" className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-600 transition-all flex items-center gap-2 group">
                            Browse Platform Ledger <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                        <button 
                            onClick={() => setShowRegistrationForm(true)}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5"
                        >
                            <FilePlus size={16} /> Register New IP
                        </button>
                    </div>
                </div>

                {isLoadingIps ? (
                    <div className="py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : myIps.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-3xl mx-auto">
                        <FilePlus className="text-slate-300 w-12 h-12 mb-3" />
                        <h4 className="text-slate-700 font-bold">No Assets Found</h4>
                        <p className="text-slate-500 text-sm max-w-sm mt-1">You haven't registered any Intellectual Property yet. Fill out the form above to secure your first document.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {myIps.map((ip: any, idx: number) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                key={ip._id}
                                onClick={() => navigate(`/ips/${ip._id}`)}
                                className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${ip.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : ip.status === 'Rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                            {ip.status}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">{ip.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-1">{ip.category}</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200/60">
                                    <p className="text-[9px] font-mono text-slate-400 uppercase">TX HASH</p>
                                    <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5" title={ip.fileHash || ip.txHash}>{ip.fileHash || ip.txHash || 'Pending TX'}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            )}

            {/* Professional Mock Payment Modal Overlay */}
            {showMockPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-10 text-center"
                    >
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <IndianRupee size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Secure Checkout</h3>
                        <p className="text-slate-500 font-medium text-sm mb-8">
                            You are currently in <span className="text-indigo-600 font-bold">Simulator Mode</span>. 
                            All transactions are recorded systematically in the platform ledger.
                        </p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount Due</span>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Test Network</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black text-slate-900">₹{cost.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400 pb-1">INR</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleExecuteMockPayment}
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1 overflow-hidden relative group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Complete Payment'
                                )}
                            </button>
                            <button
                                onClick={() => { setShowMockPayment(false); setError('Payment simulation cancelled.'); }}
                                className="w-full bg-white hover:bg-slate-50 text-slate-400 font-bold py-3 px-4 rounded-2xl transition-all text-xs"
                            >
                                Cancel Transaction
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* AI Plagiarism Scanning Modal Override */}
            {isScanning && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 p-10 text-center animate-in fade-in zoom-in duration-300">
                        {scanState === 'scanning' && (
                            <div className="space-y-8">
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-0 m-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                                        <Shield className="text-indigo-600 animate-pulse" size={32} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">AI Plagiarism Scanner</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">Analyzing semantic patterns and cross-referencing your document against the global blockchain registry...</p>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-600 h-full animate-[progress_3s_ease-in-out_forwards] rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                        )}
                        
                        {scanState === 'clean' && (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="w-32 h-32 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                                    <CheckCircle2 size={64} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-emerald-600 mb-2">100% Unique Verified</h3>
                                    <p className="text-slate-500 font-medium">Your Intellectual Property has passed all security checks. Proceeding to securely register...</p>
                                </div>
                            </div>
                        )}

                        {scanState === 'plagiarized' && (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="w-32 h-32 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-inner">
                                    <AlertTriangle size={64} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-rose-600 mb-2">Plagiarism Detected</h3>
                                    <p className="text-slate-600 font-medium mb-6">Our AI Scanner has blocked this submission because it matches <b>{Math.round(scanReport?.highestScore * 100)}%</b> with an existing protected asset.</p>
                                    
                                    <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl text-left mb-8 shadow-sm">
                                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-1">Matched Record In Database</p>
                                        <p className="font-bold text-slate-900 text-lg line-clamp-2">{scanReport?.matchedIP?.title}</p>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">Currently Owned by: <span className="text-slate-700 font-bold">{scanReport?.matchedIP?.ownerName}</span></p>
                                    </div>

                                    <button 
                                        onClick={() => { setIsScanning(false); setScanState('idle'); }}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-4 rounded-2xl transition-all hover:-translate-y-1 shadow-lg hover:shadow-slate-900/20"
                                    >
                                        Modify Submission
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IPRegistration;
