import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-terracotta/10 text-terracotta flex items-center justify-center animate-pulse mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-charcoal dark:text-charcoal-dark">Opening your Memory Album...</h2>
        <p className="text-sm text-slate dark:text-slate-dark mt-1">Preserving life's meaningful moments</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
