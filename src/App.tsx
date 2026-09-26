import React from 'react';
import { MeetingProvider, useMeeting } from './context/MeetingContext';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { AppHeader } from './components/AppHeader';
import { DashboardPage } from './pages/DashboardPage';
import { MyActionsPage } from './pages/MyActionsPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { OpenQuestionsPage } from './pages/OpenQuestionsPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingScreen } from './pages/OnboardingScreen';
import { SharingModal } from './components/SharingModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ImportMeetingModal } from './components/ImportMeetingModal';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { EvidenceExplorerModal } from './components/EvidenceExplorerModal';
import { ToastManager } from './components/ToastManager';

const AppLayout: React.FC = () => {
  const {
    activeMeetingId,
    activeView,
    isAuthenticated,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    isAccountModalOpen,
    setIsAccountModalOpen
  } = useMeeting();

  // Authentication Gate: Render entry experience if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLoginSuccess={() => setHasCompletedOnboarding(false)} />
        <ToastManager />
      </>
    );
  }

  // First-Time Onboarding Gate
  if (!hasCompletedOnboarding) {
    return (
      <>
        <OnboardingScreen onComplete={() => setHasCompletedOnboarding(true)} />
        <ToastManager />
      </>
    );
  }

  const renderMainContent = () => {
    if (activeMeetingId) {
      return <MeetingDetailPage />;
    }
    switch (activeView) {
      case 'actions':
        return <MyActionsPage />;
      case 'decisions':
        return <DecisionsPage />;
      case 'questions':
        return <OpenQuestionsPage />;
      case 'my-meetings':
        return <MeetingsPage initialScope="my" />;
      case 'meetings':
        return <MeetingsPage initialScope="all" />;
      case 'overview':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      className="workspace-shell"
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0d1117'
      }}
    >
      {/* Left Workspace Sidebar */}
      <WorkspaceSidebar />

      {/* Main Workspace Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
          overflow: 'hidden'
        }}
      >
        <AppHeader />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {renderMainContent()}
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <SharingModal />
      <GlobalSearchModal />
      <ImportMeetingModal />
      <AccountSwitcherModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
      <EvidenceExplorerModal />
      <ToastManager />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MeetingProvider>
      <AppLayout />
    </MeetingProvider>
  );
};

export default App;

