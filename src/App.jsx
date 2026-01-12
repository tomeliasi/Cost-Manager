import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/Shell.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import ChartsPage from './pages/ChartsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { AppProviders } from './state/AppProviders.jsx';

/**
 * Main routing.
 */
export default function App() {
  return (
    <AppProviders>
      <Shell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Shell>
    </AppProviders>
  );
}
