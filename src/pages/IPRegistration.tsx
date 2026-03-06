import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, Type, List, Tag, Shield, IndianRupee, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

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

    const [pricingMatrix, setPricingMatrix] = useState<Record<string, number>>({
        Patent: 750, Trademark: 850, Copyright: 35, 'Trade Secret': 50, Other: 100
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showMockPayment, setShowMockPayment] = useState(false);
    const [mockOrderData, setMockOrderData] = useState<any>(null);

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

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

        // Clear old errors and open the Live Razorpay Payment Module
        setError('');
        try {
            await handlePaymentConfirm();
        } catch (err: any) {
            console.error("Caught in handleSubmit:", err);
            alert("Unexpected error: " + err.message);
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
                            validityPeriod: typeof validityPeriod === 'number' ? validityPeriod : (parseInt(validityPeriod as string) || 1)
                        });

                        navigate('/dashboard');
                    } catch (verificationError: any) {
                        console.error("Payment Verification or Final Submission Failed:", verificationError);
                        setError(verificationError.response?.data?.error || "Payment was verified but registration failed.");
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: user?.name || "IP Creator",
                    email: user?.email || "creator@example.com",
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
                validityPeriod: typeof validityPeriod === 'number' ? validityPeriod : (parseInt(validityPeriod as string) || 1)
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
        <div className="max-w-3xl border border-gray-200 bg-white rounded-xl shadow-lg mx-auto overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-indigo-600" /> Register Intellectual Property
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Upload your documents to secure them with a permanent SHA-256 hash on the platform.
                </p>
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
                                type="number"
                                min="1"
                                max="99"
                                value={validityPeriod}
                                onChange={(e) => setValidityPeriod(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2.5 border"

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

            {/* Simulated Mock Payment Modal Overlay */}
            {showMockPayment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Test Environment Payment
                            </h3>
                            <button onClick={() => setShowMockPayment(false)} className="text-indigo-200 hover:text-white transition">&times;</button>
                        </div>
                        <div className="p-6 space-y-6 text-center">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IndianRupee size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">Complete Mock Payment</h4>
                            <p className="text-sm text-gray-500">
                                You are currently using the Blockchain IPR <span className="font-bold text-indigo-600">Test Mode</span>.
                                No real funds will be deducted.
                            </p>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center text-lg font-mono">
                                <span className="text-gray-600">Amount Due:</span>
                                <span className="font-bold text-indigo-700">₹{cost.toLocaleString()}</span>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={handleExecuteMockPayment}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                                >
                                    Simulate Successful Payment
                                </button>
                                <button
                                    onClick={() => { setShowMockPayment(false); setError('Payment simulation cancelled by user.'); }}
                                    className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-3 px-4 rounded-lg transition"
                                >
                                    Cancel Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IPRegistration;
