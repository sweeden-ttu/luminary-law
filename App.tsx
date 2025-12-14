import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Intake from './components/Intake';
import { UserRole } from './types';

const App: React.FC = () => {
  const [currentRole, setRole] = useState<UserRole>(UserRole.ATTORNEY);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout 
      currentRole={currentRole} 
      setRole={setRole}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-8rem)]">
             <ChatInterface userRole={currentRole} />
          </div>
        )}
        {activeTab === 'intake' && <Intake />}
      </div>
    </Layout>
  );
};

export default App;
