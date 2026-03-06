import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import IPRegistration from './pages/IPRegistration';
import IPListing from './pages/IPListing';
import IPDetail from './pages/IPDetail';
import VerificationModule from './pages/VerificationModule';
import DisputeResolution from './pages/DisputeResolution';
import FileDispute from './pages/FileDispute';
import RoyaltyHistory from './pages/RoyaltyHistory';
import Settings from './pages/Settings';

function RootRedirect() {
    const { isAuthenticated, isAdminView, isLoading, user } = useContext(AuthContext);

    if (isLoading) return null; // Let the core layer handle the spinner

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (user?.role === 'Admin') {
        return isAdminView ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/dashboard" replace />;
    }

    // Normal users don't have a dashboard anymore, send to Registry
    return <Navigate to="/ips" replace />;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                    <Navbar />
                    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

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
                                    <RoleProtectedRoute allowedRoles={['Admin']}>
                                        <CreatorDashboard />
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
                                        <RoyaltyHistory />
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

                            {/* Redirect root intelligently */}
                            <Route path="/" element={<RootRedirect />} />

                            {/* Fallback route */}
                            <Route path="*" element={<RootRedirect />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
