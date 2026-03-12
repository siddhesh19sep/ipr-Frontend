import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Lock,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Mail,
  CheckCircle2,
  ChevronRight,
  Database,
  Key,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Settings() {
  const { user, login } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.token) {
        login(response.data.token, response.data.user);
      }
      alert('Avatar uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload avatar', err);
      alert('Failed to upload avatar.');
    }
  };

  // Fallback defaults
  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
      setWalletAddress(user.walletAddress || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // This call hits the backend to update standard metadata
      const response = await api.put('/auth/profile', { name, username, email, walletAddress });

      if (response.data.token) {
        login(response.data.token, response.data.user);
      }

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed!');
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      alert(err.message || 'Failed to connect wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  const [twoFactor, setTwoFactor] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm">Configure your profile, security, and system preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <UserIcon size={20} className="text-indigo-600" />
              Profile Configuration
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 text-2xl font-bold overflow-hidden shadow-inner">
                {user?.avatarUrl ? (
                  <img src={"https://ipr-backend-u4al.onrender.com" + user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  name ? name.substring(0, 2).toUpperCase() : 'US'
                )}
              </div>
              <div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/png, image/jpeg" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                >
                  Change Avatar
                </button>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">Max size 2MB. JPG or PNG.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Web3 Wallet Integration</label>
                {walletAddress ? (
                  <div className="flex items-center justify-between pl-4 pr-3 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl w-full h-[48px]">
                    <div className="flex items-center w-full min-w-0">
                      <div className="bg-indigo-600/10 p-1.5 rounded-lg mr-3 flex-shrink-0">
                        <Wallet className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-indigo-900 truncate pr-2">{walletAddress}</span>
                    </div>
                    <button
                      onClick={() => setWalletAddress('')}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      Unlink
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="flex justify-center items-center gap-2 w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-2xl text-sm font-bold transition-all h-[48px]"
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" /> Connect MetaMask
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              Security & Authentication
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Secure your account with an extra layer of security</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-12 h-6 rounded-full transition-all relative ${twoFactor ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${twoFactor ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                  <Key size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Change Password</p>
                  <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Blockchain Node Config</p>
                  <p className="text-xs text-slate-500">Manage your connection to the IP ledger</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              Notification Preferences
            </h3>
          </div>
          <div className="p-8 space-y-4">
            {[
              { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and urgent alerts via email', icon: Mail },
              { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts in your browser and mobile device', icon: Globe },
              { id: 'sms', label: 'SMS Alerts', desc: 'Critical security and payment alerts via text message', icon: Smartphone },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                  className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.id as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button className="px-6 py-3 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Discard Changes
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
