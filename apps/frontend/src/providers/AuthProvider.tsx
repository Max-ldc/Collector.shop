import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak from 'keycloak-js';
import keycloakInstance from '../keycloak';

interface AuthContextType {
    isAuthenticated: boolean;
    userRoles: string[];
    initialized: boolean;
    login: () => void;
    logout: () => void;
    token?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                const authenticated = await keycloakInstance.init({
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                    enableLogging: true
                });

                setIsAuthenticated(authenticated);
                if (authenticated) {
                    setUserRoles(keycloakInstance.tokenParsed?.realm_access?.roles || []);
                }
                setInitialized(true);
            } catch (error) {
                console.error('Failed to initialize Keycloak', error);
                setInitialized(true); // Still mark as initialized to avoid infinite loading
            }
        };

        if (!initialized) {
            initKeycloak();
        }
    }, [initialized]);

    const login = () => {
        keycloakInstance.login();
    };

    const logout = () => {
        keycloakInstance.logout({
            redirectUri: window.location.origin
        });
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userRoles,
                initialized,
                login,
                logout,
                token: keycloakInstance.token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
