import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
    const { login } = useAuth();

    // Simplification: we delegate the login to the Keycloak redirect directly.
    // Error handling is managed by Keycloak or global application state.

    return (
        <div className="login-container">
            <h2>Login</h2>
            <button onClick={login}>Login with Keycloak</button>
        </div>
    );
};

export default Login;