import React from 'react';
import { MeetingProvider, useMeeting } from './context/MeetingContext';
import { AppHeader } from './components/AppHeader';
import { DashboardPage } from './pages/DashboardPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';
import { SharingModal } from './components/SharingModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SimulateMeetingModal } from './components/SimulateMeetingModal';
import { ToastManager } from './components/ToastManager';

const AppLayout: React.FC = () => {
  const { activeMeetingId } = useMeeting();

  return (
    <div className="app-container">
      <AppHeader />
      {activeMeetingId ? <MeetingDetailPage /> : <DashboardPage />}

      {/* Global Modals & Notifications */}
      <SharingModal />
      <GlobalSearchModal />
      <SimulateMeetingModal />
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
