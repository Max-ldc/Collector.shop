import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
    const { isAuthenticated, login, logout, userRoles } = useAuth();

    const styles = {
        nav: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'sticky' as const,
            top: 0,
            zIndex: 1000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        leftSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
        },
        brand: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            textDecoration: 'none',
            letterSpacing: '-0.5px'
        },
        link: {
            textDecoration: 'none',
            color: '#555',
            fontWeight: 500,
            fontSize: '0.95rem',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        activeLink: {
            color: '#2ecc71', // Brand color from dashboard
        },
        button: {
            padding: '0.5rem 1.2rem',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'background-color 0.2s'
        },
        loginBtn: {
            backgroundColor: '#2ecc71',
            color: 'white',
        },
        logoutBtn: {
            backgroundColor: 'transparent',
            color: '#e74c3c',
            border: '1px solid #e74c3c'
        }
    };

    const isAdmin = userRoles.includes('ROLE_ADMIN') || userRoles.includes('admin');

    return (
        <nav style={styles.nav}>
            <div style={styles.leftSection}>
                <Link to="/" style={styles.brand}>Collector</Link>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/" style={styles.link}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#2c3e50'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#555'}>
                        Accueil
                    </Link>

                    {isAuthenticated && (
                        <Link to="/sell" style={styles.link}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#2c3e50'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#555'}>
                            Vendre
                        </Link>
                    )}

                    {isAdmin && (
                        <Link to="/admin" style={{ ...styles.link, color: '#e67e22' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#d35400'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#e67e22'}>
                            Administration
                        </Link>
                    )}
                </div>
            </div>

            <div>
                {isAuthenticated ? (
                    <button
                        onClick={() => logout()}
                        style={{ ...styles.button, ...styles.logoutBtn }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e74c3c';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#e74c3c';
                        }}
                    >
                        Se déconnecter
                    </button>
                ) : (
                    <button
                        onClick={() => login()}
                        style={{ ...styles.button, ...styles.loginBtn }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'}
                    >
                        Se connecter
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
