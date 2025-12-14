import React from 'react';
import { Case } from '../types';
import { Recharts } from 'recharts'; // Placeholder, actual import handled below via pure SVG or library if available

// Mock Data
const MOCK_CASES: Case[] = [
  { id: '1', clientName: 'John Doe', practiceArea: 'Personal Injury', status: 'Discovery', lastActivity: '2 hours ago' },
  { id: '2', clientName: 'Sarah Smith', practiceArea: 'Probate', status: 'New', lastActivity: '1 day ago' },
  { id: '3', clientName: 'Tech Corp LLC', practiceArea: 'Commercial', status: 'Trial Prep', lastActivity: '4 hours ago' },
  { id: '4', clientName: 'Robert Johnson', practiceArea: 'SSDI', status: 'Closed', lastActivity: '1 week ago' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Matters</h3>
        <p className="text-3xl font-serif font-bold text-legal-800 mt-2">24</p>
        <div className="mt-2 text-green-600 text-xs font-medium">↑ 2 new this week</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending Filings</h3>
        <p className="text-3xl font-serif font-bold text-legal-800 mt-2">7</p>
        <div className="mt-2 text-yellow-600 text-xs font-medium">3 due within 48h</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Client Intake</h3>
        <p className="text-3xl font-serif font-bold text-legal-800 mt-2">12</p>
        <div className="mt-2 text-blue-600 text-xs font-medium">Needs review</div>
      </div>

      {/* Case List */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-serif font-bold text-legal-900">Recent Cases</h2>
          <button className="text-sm text-legal-600 hover:text-legal-800 font-medium">View All</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Practice Area</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_CASES.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.clientName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.practiceArea}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    c.status === 'Discovery' ? 'bg-purple-100 text-purple-800' :
                    c.status === 'Trial Prep' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 text-right">{c.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="bg-legal-900 text-white rounded-xl shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="z-10 relative">
          <h2 className="font-serif font-bold text-xl mb-2">Daily Briefing</h2>
          <p className="text-legal-200 text-sm mb-6">
            You have 3 statutes of limitations expiring this month. Review the <i>Garcia</i> file for motion in limine.
          </p>
          <button className="w-full bg-white text-legal-900 font-semibold py-2 px-4 rounded hover:bg-legal-100 transition-colors">
            Generate Report
          </button>
        </div>
        {/* Abstract shape decoration */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-legal-700 rounded-full opacity-50 z-0"></div>
      </div>
    </div>
  );
};

export default Dashboard;
