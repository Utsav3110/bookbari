import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

// Pages
import BookList from './pages/BookList';
import Login from './pages/Login';
import AdminOverview from './pages/AdminOverview';
import AdminBooks from './pages/AdminBooks';
import AdminAuthors from './pages/AdminAuthors';
import AdminGenres from './pages/AdminGenres';
import AdminLanguages from './pages/AdminLanguages';
import AdminCheckouts from './pages/AdminCheckouts';
import AdminOverdue from './pages/AdminOverdue';
import AdminManageAdmins from './pages/AdminManageAdmins';

import './index.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  const isApproved = user?.status === 'APPROVED';
  const isAdmin = isApproved && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-paper-100">Access Denied</h2>
        <p className="text-sm text-ink-muted dark:text-paper-400 mt-1">You must be an approved admin to view this section.</p>
      </div>
    );
  }
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <ProtectedRoute>
              <AdminBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/authors"
          element={
            <ProtectedRoute>
              <AdminAuthors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/genres"
          element={
            <ProtectedRoute>
              <AdminGenres />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/languages"
          element={
            <ProtectedRoute>
              <AdminLanguages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/checkouts"
          element={
            <ProtectedRoute>
              <AdminCheckouts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/overdue"
          element={
            <ProtectedRoute>
              <AdminOverdue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <ProtectedRoute>
              <AdminManageAdmins />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating WhatsApp button accessible across pages */}
      <FloatingWhatsApp />
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
