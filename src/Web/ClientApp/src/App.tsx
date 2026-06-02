/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPOS from './pages/AdminPOS';
import AdminInventory from './pages/AdminInventory';
import AdminTables from './pages/AdminTables';
import AdminReports from './pages/AdminReports';
import AdminProfile from './pages/AdminProfile';
import AdminLayout from './components/Admin/AdminLayout';
import ProtectedRoute from './components/Admin/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#0f3229',
          color: '#ffffff',
          border: '1px solid #8fa8a4'
        }
      }} />
      <Routes>
        <Route path="/" element={<Navigate to="/menu/1" replace />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'barista']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pos" element={<AdminPOS />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="inventory" element={<AdminInventory />} />
            
            {/* Routes explicitly for 'admin' role only */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="tables" element={<AdminTables />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
