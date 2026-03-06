import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useContext(AuthContext);

    // Provide a simple loading state while checking token
    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role check
    if (!allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to login so they can refresh their cache
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default RoleProtectedRoute;
