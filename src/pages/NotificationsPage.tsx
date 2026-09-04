import React, { useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications } from '../services/firestore';
import { AppNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getNotifications(currentUser.uid).then(setNotifications).catch(console.error).finally(() => setLoading(false));
    }
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-terracotta">
          <Bell className="w-6 h-6" />
          <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-charcoal-dark">Notifications</h1>
        </div>
        <p className="text-sm text-slate dark:text-slate-dark mt-1">Updates on unlocked capsules, future letters, and anniversary moments.</p>
      </div>

      {!loading && notifications.length === 0 && (
        <div className="p-12 bg-card-light dark:bg-card-dark rounded-3xl border border-dashed border-sand dark:border-sand-dark text-center space-y-3">
          <Bell className="w-8 h-8 text-terracotta/40 mx-auto" />
          <h3 className="font-serif text-xl font-bold">All caught up!</h3>
          <p className="text-xs text-slate dark:text-slate-dark">You have no unread notifications.</p>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-sand dark:border-sand-dark space-y-1 text-xs">
            <h4 className="font-bold text-charcoal dark:text-charcoal-dark">{n.title}</h4>
            <p className="text-slate dark:text-slate-dark">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
