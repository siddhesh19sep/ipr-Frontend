import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
    account: string | null;
    provider: ethers.BrowserProvider | null;
    chainId: string | null;
    isConnecting: boolean;
    error: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

export const Web3Context = createContext<Web3ContextType>({
    account: null,
    provider: null,
    chainId: null,
    isConnecting: false,
    error: null,
    connectWallet: async () => {},
    disconnectWallet: () => {},
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [chainId, setChainId] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkConnection = useCallback(async () => {
        if (window.ethereum) {
            try {
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await browserProvider.listAccounts();
                if (accounts.length > 0) {
                    const network = await browserProvider.getNetwork();
                    setAccount(accounts[0].address);
                    setProvider(browserProvider);
                    setChainId(network.chainId.toString());
                }
            } catch (err) {
                console.error("Early connection check failed:", err);
            }
        }
    }, []);

    useEffect(() => {
        checkConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
                window.ethereum.removeListener('chainChanged', () => {});
            }
        };
    }, [checkConnection]);

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("MetaMask is not installed. Please install it to connect.");
            return;
        }

        setIsConnecting(true);
        setError(null);
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send("eth_requestAccounts", []);
            const network = await browserProvider.getNetwork();
            
            setAccount(accounts[0]);
            setProvider(browserProvider);
            setChainId(network.chainId.toString());
        } catch (err: any) {
            setError(err.message || "Failed to connect wallet.");
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setChainId(null);
    };

    return (
        <Web3Context.Provider value={{ account, provider, chainId, isConnecting, error, connectWallet, disconnectWallet }}>
            {children}
        </Web3Context.Provider>
    );
};

declare global {
    interface Window {
        ethereum: any;
    }
}
