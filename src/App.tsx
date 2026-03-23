import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/CreatorDashboard';
import IPRegistration from './pages/IPRegistration';
import IPListing from './pages/IPListing';
import IPDetail from './pages/IPDetail';
import VerificationModule from './pages/VerificationModule';
import DisputeResolution from './pages/DisputeResolution';
import FileDispute from './pages/FileDispute';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import PublicVerification from './pages/PublicVerification';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyLicenses from './pages/MyLicenses';

function RootRedirect() {
    const { isAuthenticated, isAdminView, isLoading, user } = useContext(AuthContext);

    if (isLoading) return null;

    if (!isAuthenticated) return <LandingPage />;

    if (user?.role === 'Admin') {
        return isAdminView ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/dashboard" replace />;
    }

    // Normal users go to Registry
    return <Navigate to="/ips" replace />;
}

function App() {
    // Keep-alive heartbeat for Render free tier
    React.useEffect(() => {
        const heartbeat = setInterval(() => {
            fetch('https://ipr-backend-1-2llk.onrender.com/api/auth/status').catch(() => {});
        }, 10 * 60 * 1000); // Every 10 minutes
        
        return () => clearInterval(heartbeat);
    }, []);

    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

function AppContent() {
    const { isAuthenticated } = useContext(AuthContext);
    const location = useLocation();
    
    // Hide global layout on public-facing pages
    const isPublicPage = location.pathname === '/' || 
                         location.pathname === '/verify' || 
                         location.pathname === '/forgot-password' || 
                         location.pathname.startsWith('/reset-password/');

    return (
        <div className={`h-screen flex flex-row overflow-hidden font-sans ${isPublicPage ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {!isPublicPage && <Sidebar />}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {!isPublicPage && <Navbar />}
                <main className={`flex-1 overflow-y-auto w-full ${isPublicPage ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
                    <div className={isPublicPage ? '' : 'max-w-7xl mx-auto w-full'}>
                        <Routes>
                            {/* Static Landing Page at Root */}
                            <Route path="/" element={<RootRedirect />} />
                            
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify" element={<PublicVerification />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />

                            {/* Protected Routes */}
                            <Route
                                path="/admin-dashboard"
                                element={
                                    <RoleProtectedRoute allowedRoles={['Admin']}>
                                        <AdminDashboard />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <RoleProtectedRoute allowedRoles={['Admin', 'User']}>
                                        <UserDashboard />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/register-ip"
                                element={
                                    <ProtectedRoute>
                                        <IPRegistration />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/ips"
                                element={
                                    <ProtectedRoute>
                                        <IPListing />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/ips/:id"
                                element={
                                    <ProtectedRoute>
                                        <IPDetail />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Advanced Features (Admin Only) */}
                            <Route
                                path="/verification"
                                element={
                                    <RoleProtectedRoute allowedRoles={['Admin']}>
                                        <VerificationModule />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/file-dispute"
                                element={
                                    <RoleProtectedRoute allowedRoles={['User', 'Admin']}>
                                        <FileDispute />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/disputes"
                                element={
                                    <RoleProtectedRoute allowedRoles={['Admin']}>
                                        <DisputeResolution />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/royalties"
                                element={
                                    <RoleProtectedRoute allowedRoles={['User', 'Admin']}>
                                        <Payments />
                                    </RoleProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-licenses"
                                element={
                                    <ProtectedRoute>
                                        <MyLicenses />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Fallback route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
