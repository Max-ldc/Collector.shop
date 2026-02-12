import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ArticleList from './components/articles/ArticleList';
import SellForm from './components/seller/SellForm';
import AdminDashboard from './components/admin/AdminDashboard';
import ArticleManagement from './components/admin/ArticleManagement';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<ArticleList />} />
        <Route path="/sell" element={
          <ProtectedRoute>
            <SellForm />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="articles" element={<ArticleManagement />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;