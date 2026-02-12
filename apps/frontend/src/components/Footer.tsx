import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{ padding: '1rem', background: '#333', color: 'white', marginTop: '2rem' }}>
            <p>&copy; {new Date().getFullYear()} Collector Shop. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
