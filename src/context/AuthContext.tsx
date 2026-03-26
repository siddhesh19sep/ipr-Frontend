import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    walletAddress?: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData?: User) => void;
    logout: () => void;
    isAdminView: boolean;
    toggleAdminView: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
    isAdminView: false,
    toggleAdminView: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const [isAdminView, setIsAdminView] = useState(false);

    useEffect(() => {
    const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            console.log("Auth Initialization - Token exists:", !!storedToken);
            if (storedToken) {
                try {
                    const decoded: any = jwtDecode(storedToken);
                    console.log("Auth Initialization - Token Decoded:", decoded.username);
                    // Check if token is expired or missing the new name payload
                    if (decoded.exp * 1000 < Date.now()) {
                        console.warn("Auth Initialization - Token Expired");
                        logout();
                    } else if (!decoded.name) {
                        console.warn("Auth Initialization - Token missing 'name' field, refreshing session...");
                        // We might want to allow this for legacy tokens but mark for refresh
                        // For now, let's just log it instead of forcing logout if we want to be less aggressive.
                    }
                    
                    setToken(storedToken);
                    const fallbackRole = decoded.role || 'User';
                    setUser({
                        id: decoded.id,
                        role: fallbackRole,
                        name: decoded.name || decoded.username || '',
                        username: decoded.username || '',
                        email: decoded.email || '',
                        walletAddress: decoded.walletAddress || '',
                        avatarUrl: decoded.avatarUrl || ''
                    });
                    setIsAdminView(fallbackRole === 'Admin');
                } catch (error) {
                    console.error("Auth Initialization - Decode Error:", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (newToken: string, userData?: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);

        if (userData) {
            setUser(userData);
            setIsAdminView(userData.role === 'Admin');
        } else {
            // Decode from token if not explicitly provided
            try {
                const decoded: any = jwtDecode(newToken);
                const fallbackRole = decoded.role || 'User';
                setUser({
                    id: decoded.id,
                    role: fallbackRole,
                    name: decoded.name || '',
                    username: decoded.username || '',
                    email: decoded.email || '',
                    walletAddress: decoded.walletAddress || '',
                    avatarUrl: decoded.avatarUrl || ''
                });
                setIsAdminView(fallbackRole === 'Admin');
            } catch (e) {
                console.error("Failed to decode token on login");
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAdminView(false);
    };

    const toggleAdminView = () => {
        if (user && user.role === 'Admin') {
            setIsAdminView(!isAdminView);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                logout,
                isAdminView,
                toggleAdminView
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
