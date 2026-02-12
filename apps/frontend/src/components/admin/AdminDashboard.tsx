import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/admin/articles">Manage Articles</Link>
                    </li>
                    <li>
                        <Link to="/admin/users">Manage Users</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminDashboard;