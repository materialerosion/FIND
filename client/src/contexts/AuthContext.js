import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { callMsGraph } from '../services/graph';

// Create context
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const { instance, accounts, inProgress } = useMsal();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const getUser = async () => {
            if (accounts.length > 0) {
                try {
                    // Get token silently
                    const response = await instance.acquireTokenSilent({
                        ...loginRequest,
                        account: accounts[0]
                    });
                    
                    // Get user profile from Microsoft Graph
                    const userProfile = await callMsGraph(response.accessToken);
                    setUser({
                        name: userProfile.displayName,
                        email: userProfile.userPrincipalName,
                        id: userProfile.id,
                        ...userProfile
                    });
                    // Persist authentication state
                    localStorage.setItem('isAuthenticated', 'true');
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                setUser(null);
                // Remove authentication state
                localStorage.removeItem('isAuthenticated');
            }
            
            setLoading(false);
        };
        
        getUser();
    }, [accounts, instance]);
    
    // On mount, if localStorage says authenticated but accounts is empty, try silent login
    useEffect(() => {
        const maxAttempts = 3;
        const attemptKey = 'autoAuthAttempts';
        if (localStorage.getItem('isAuthenticated') === 'true' && accounts.length === 0) {
            let attempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
            if (attempts < maxAttempts) {
                localStorage.setItem(attemptKey, (attempts + 1).toString());
                // Try to trigger login silently using redirect
                instance.loginRedirect(loginRequest).catch(() => {});
            }
        }
    }, []);
    
    // Reset auto-auth attempts on successful login or logout
    useEffect(() => {
        const attemptKey = 'autoAuthAttempts';
        if (accounts.length > 0 || localStorage.getItem('isAuthenticated') !== 'true') {
            localStorage.removeItem(attemptKey);
        }
    }, [accounts]);
    
    const login = async (method = '') => {
        try {
            if (method === 'popup') {
                await instance.loginPopup(loginRequest);
            } else {
                await instance.loginRedirect(loginRequest);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
    
    const logout = async (method = 'popup') => {
        try {
            if (method === 'popup') {
                await instance.logoutPopup({
                    postLogoutRedirectUri: window.location.origin,
                });
            } else {
                await instance.logoutRedirect({
                    postLogoutRedirectUri: window.location.origin,
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    
    const value = {
        user,
        isAuthenticated: accounts.length > 0,
        loading,
        login,
        logout
    };
    
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 