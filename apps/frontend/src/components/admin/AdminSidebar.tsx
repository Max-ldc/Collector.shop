import React from 'react';
import { Link } from 'react-router-dom';

export const AdminSidebar: React.FC = () => {
    return (
        <aside style={{ width: '200px', background: '#f5f5f5', padding: '1rem', height: '100vh', float: 'left' }}>
            <h3>Admin Panel</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><Link to="/admin">Dashboard</Link></li>
                <li><Link to="/admin/articles">Articles</Link></li>
            </ul>
        </aside>
    );
};
