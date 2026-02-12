import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;