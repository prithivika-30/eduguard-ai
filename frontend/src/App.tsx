import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GuidedTourModal } from './components/common/GuidedTourModal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { RiskQueuePage } from './pages/RiskQueuePage';
import { InterventionsPage } from './pages/InterventionsPage';
import { FollowupsPage } from './pages/FollowupsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DataImportPage } from './pages/DataImportPage';
import { ModelsPage } from './pages/ModelsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Initializing EduGuard AI...</span>
        </div>
      </div>
    );
  }

  // Render logic based on path
  const renderCurrentPage = () => {
    if (currentPath === '/') {
      return <LandingPage onNavigate={navigate} onOpenTour={() => setIsTourOpen(true)} />;
    }

    if (currentPath === '/login') {
      return <LoginPage onLoginSuccess={() => navigate('/dashboard')} />;
    }

    // Student detail sub-route: /students/:id
    if (currentPath.startsWith('/students/') && currentPath !== '/students') {
      const parts = currentPath.split('/');
      const id = parseInt(parts[2], 10) || 1;
      return <StudentDetailPage studentId={id} onBack={() => navigate('/students')} onNavigate={navigate} />;
    }

    switch (currentPath) {
      case '/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/students':
        return <StudentsPage onNavigate={navigate} />;
      case '/what-if':
        return <WhatIfPage />;
      case '/risks':
        return <RiskQueuePage onNavigate={navigate} />;
      case '/interventions':
        return <InterventionsPage onNavigate={navigate} />;
      case '/follow-up':
        return <FollowupsPage onNavigate={navigate} />;
      case '/analytics':
        return <AnalyticsPage />;
      case '/data':
        return <DataImportPage />;
      case '/models':
        return <ModelsPage />;
      case '/reports':
        return <ReportsPage />;
      case '/settings':
        return <SettingsPage />;
      case '/help':
        return <HelpPage />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  const isPublicPage = currentPath === '/' || currentPath === '/login';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenTour={() => setIsTourOpen(true)} onNavigate={navigate} />

      <div className="flex-1 flex overflow-hidden">
        {!isPublicPage && (
          <Sidebar currentPath={currentPath} onNavigate={navigate} />
        )}

        <main className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-slate-950">
          {renderCurrentPage()}
        </main>
      </div>

      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
