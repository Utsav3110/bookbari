import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      showSuccess('Welcome back! Admin login successful.');
      navigate('/admin');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      showError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white dark:bg-charcoal-50 rounded-xl shadow-card p-8 border border-paper-300 dark:border-charcoal-300">
        <h1 className="text-2xl font-serif font-bold text-center text-ink dark:text-paper-100 mb-6">Admin Login</h1>
        
        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-950/40 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink dark:text-paper-100 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-hidden dark:bg-charcoal-200 dark:border-charcoal-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink dark:text-paper-100 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-hidden dark:bg-charcoal-200 dark:border-charcoal-300"
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg font-medium transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
