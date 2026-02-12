import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
    const { isAuthenticated, login, logout, userRoles } = useAuth();
    const navigate = useNavigate();

    return (
        <nav style={{ padding: '1rem', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
                {isAuthenticated && <Link to="/sell" style={{ marginRight: '1rem' }}>Sell</Link>}
                {userRoles.includes('admin') && <Link to="/admin">Admin</Link>}
            </div>
            <div>
                {isAuthenticated ? (
                    <button onClick={() => logout()}>Logout</button>
                ) : (
                    <button onClick={() => login()}>Login</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
