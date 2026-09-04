import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import WelcomePage from './pages/auth/WelcomePage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';

import HomePage from './pages/HomePage';
import PeoplePage from './pages/PeoplePage';
import PersonProfilePage from './pages/PersonProfilePage';
import TimelinePage from './pages/TimelinePage';
import MemoryDetailPage from './pages/MemoryDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import OnThisDayPage from './pages/OnThisDayPage';
import MemoryCapsulesPage from './pages/MemoryCapsulesPage';
import FutureLettersPage from './pages/FutureLettersPage';
import AIStoryPage from './pages/AIStoryPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

export const router = createBrowserRouter([
  // AUTH ROUTES
  { path: '/welcome', element: <WelcomePage /> },
  { path: '/signin', element: <SignInPage /> },
  { path: '/create-account', element: <SignUpPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email', element: <EmailVerificationPage /> },

  // PROTECTED APP ROUTES
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'people', element: <PeoplePage /> },
      { path: 'person/:personId', element: <PersonProfilePage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'memory/:memoryId', element: <MemoryDetailPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'on-this-day', element: <OnThisDayPage /> },
      { path: 'capsules', element: <MemoryCapsulesPage /> },
      { path: 'future-letters', element: <FutureLettersPage /> },
      { path: 'ai-story', element: <AIStoryPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
