import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldCheck, Zap, Globe, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

// Using the provided AI-generated asset paths
const HERO_IMAGE = "/blockchain_hero_vision_1773668439640.png";
const DASHBOARD_MOCKUP = "/ipr_dashboard_mockup_1773668463342.png";

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            
            {/* Premium Sticky Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            IPR<span className="text-indigo-400">Chain</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
                        <Link to="/verify" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Public Verification</Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link to="/login" className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="bg-white text-slate-950 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/5 active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
                                <Zap className="h-3 w-3" />
                                Next-Gen IP Security
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                                Secure Your <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">Digital Legacy</span> on Blockchain
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                The world's most advanced platform for Intellectual Property registration, AI plagiarism detection, and instant global verification.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/register" className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-2 transition-all shadow-2xl shadow-indigo-500/20">
                                    Protect Your Work
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/verify" className="px-8 py-4 text-slate-300 hover:text-white font-bold text-lg transition-colors">
                                    Search Registry
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-[2.5rem]"></div>
                            <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden aspect-square lg:aspect-video">
                                <img 
                                    src={HERO_IMAGE} 
                                    alt="Blockchain Network Visualization" 
                                    className="w-full h-full object-cover rounded-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">Network Status</p>
                                            <p className="text-sm text-emerald-400 font-medium">Secured by Polygon Amoy</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight">Enterprise-Grade Modules</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to register, protect, and monetize your intellectual assets in one unified platform.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Zap className="h-6 w-6 text-indigo-400" />}
                            title="AI Plagiarism Scan"
                            description="Automatically verify the uniqueness of your work against our entire global database using advanced AI similarity algorithms."
                        />
                        <FeatureCard 
                            icon={<Globe className="h-6 w-6 text-blue-400" />}
                            title="Immutable Registry"
                            description="Your assets are timestamped and hashed onto the blockchain, creating permanent, unfalsifiable proof of ownership."
                        />
                        <FeatureCard 
                            icon={<Lock className="h-6 w-6 text-emerald-400" />}
                            title="Smart Verification"
                            description="Public-facing portal that allows anyone to verify your certificates instantly via a unique ID or QR code."
                        />
                    </div>
                </div>
            </section>

            {/* Product Preview Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 p-8 lg:p-16 relative z-10 backdrop-blur-sm">
                        <div className="grid lg:grid-cols-5 gap-16 items-center">
                            <div className="lg:col-span-2 space-y-8">
                                <h2 className="text-4xl font-bold text-white leading-tight">Designed for the Next Generation of Users</h2>
                                <p className="text-slate-400 leading-relaxed">
                                    Our interface combines high-performance data tracking with a beautiful glassmorphism aesthetic, ensuring you can manage your IPR portfolio with surgical precision and visual excellence.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-slate-200">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                        <span>Real-time Royalty Tracking</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-200">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                        <span>Automated Dispute Filing</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-200">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                        <span>Web3 Wallet Support</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="lg:col-span-3">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                        <img 
                                            src={DASHBOARD_MOCKUP} 
                                            alt="Platform Dashboard Preview" 
                                            className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center">
                <div className="max-w-4xl mx-auto px-6 space-y-8">
                    <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">Ready to Secure Your Work?</h2>
                    <p className="text-xl text-slate-400">Join thousands of users protecting their legacy on the blockchain.</p>
                    <div className="pt-4">
                        <Link to="/register" className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-extrabold text-xl hover:bg-slate-100 transition-all shadow-2xl shadow-white/10 active:scale-95">
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-500" />
                        <span className="font-bold text-white">IPRChain</span>
                    </div>
                    <p className="text-sm text-slate-500">© 2026 IPR Blockchain Project. All rights reserved.</p>
                    <div className="flex items-center space-x-6">
                        <Link to="/verify" className="text-sm text-slate-400 hover:text-white transition-colors">Verify Portal</Link>
                        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Legal</a>
                        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:border-indigo-500/30 transition-all group hover:-translate-y-2">
            <div className="mb-6 p-3 bg-slate-950 rounded-2xl w-fit border border-white/5 shadow-inner group-hover:shadow-indigo-500/10 transition-shadow">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
};

export default LandingPage;
