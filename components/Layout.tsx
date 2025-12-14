import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRole, setRole, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-legal-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-legal-800 text-white flex flex-col shadow-lg z-20">
        <div className="p-6 border-b border-legal-700">
          <h1 className="font-serif text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">⚖️</span> Law Luminary
          </h1>
          <p className="text-xs text-legal-300 mt-1">Texas Plaintiff Firm Edition</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-legal-700 text-white' : 'text-legal-300 hover:bg-legal-700 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'chat' ? 'bg-legal-700 text-white' : 'text-legal-300 hover:bg-legal-700 hover:text-white'
            }`}
          >
            💬 Research & Draft
          </button>
          <button
            onClick={() => setActiveTab('intake')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'intake' ? 'bg-legal-700 text-white' : 'text-legal-300 hover:bg-legal-700 hover:text-white'
            }`}
          >
            📋 Case Intake
          </button>
        </nav>

        <div className="p-4 border-t border-legal-700 bg-legal-900">
          <div className="text-xs uppercase text-legal-400 font-bold mb-2">Simulate Role</div>
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full bg-legal-800 border border-legal-600 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="text-lg font-medium text-gray-700">
            {activeTab === 'dashboard' && 'Firm Overview'}
            {activeTab === 'chat' && 'Assistant Workspace'}
            {activeTab === 'intake' && 'New Client Intake'}
          </div>
          <div className="flex items-center gap-4">
             {!process.env.API_KEY && (
                 <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded border border-red-200">
                     Warning: No API_KEY detected
                 </span>
             )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-legal-200 flex items-center justify-center text-legal-700 font-bold">
                {currentRole.charAt(0)}
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold leading-none">{currentRole}</p>
                <p className="text-xs text-gray-400">Logged In</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
