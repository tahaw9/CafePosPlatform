import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rendere Access Denied UI
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 rtl" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">عدم دسترسی</h2>
          <p className="text-gray-500 font-medium mb-6">
            شما مجوز لازم برای دسترسی به این بخش را ندارید.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-[#0f3229] hover:bg-[#0b261f] text-white py-3 rounded-xl font-medium transition-colors"
          >
            بازگشت به صفحه قبل
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
