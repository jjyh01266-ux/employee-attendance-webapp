import React, { useState } from 'react';
import {
  AppData,
  LeaveApplication,
  Employee,
  AppSettings,
  ApplicationStatus,
  ManagerSubTab,
} from '../../types';
import {
  FileCheck2,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ManagerApplications } from './ManagerApplications';
import { ManagerEmployees } from './ManagerEmployees';
import { ManagerSettings } from './ManagerSettings';

interface ManagerDashboardProps {
  appData: AppData;
  onUpdateApplicationStatus: (
    id: string,
    status: ApplicationStatus,
    rejectionReason?: string
  ) => void;
  onCreateEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onToggleActiveEmployee: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreBackup: (backupData: AppData) => void;
  onResetApplications: () => void;
  onResetAllData: () => void;
  onExitManager: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  appData,
  onUpdateApplicationStatus,
  onCreateEmployee,
  onUpdateEmployee,
  onToggleActiveEmployee,
  onDeleteEmployee,
  onUpdateSettings,
  onRestoreBackup,
  onResetApplications,
  onResetAllData,
  onExitManager,
}) => {
  const [activeTab, setActiveTab] = useState<ManagerSubTab>('applications');

  // Compute pending applications count for tab notification badge
  const pendingCount = appData.applications.filter((a) => a.status === '승인대기').length;

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-6 max-w-7xl mx-auto overflow-hidden">
      {/* High Density Main Container Card */}
      <div className="w-full bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col h-full justify-between">
        {/* Subtab Navigation Bar */}
        <div className="bg-[#f8fafc] border-b-2 border-[#e2e8f0] px-6 py-4 flex flex-wrap items-center justify-between shrink-0 gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 bg-[#e2e8f0] p-1.5 rounded-2xl">
            <button
              id="tab-manager-applications"
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-[#1d4ed8] text-white shadow-sm'
                  : 'text-[#1e293b] hover:bg-[#cbd5e1]'
              }`}
            >
              <FileCheck2 className="w-5 h-5" />
              <span>근무 상황 관리 (결재)</span>
              {pendingCount > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${
                    activeTab === 'applications'
                      ? 'bg-white text-[#1d4ed8]'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              id="tab-manager-employees"
              type="button"
              onClick={() => setActiveTab('employees')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
                activeTab === 'employees'
                  ? 'bg-[#1d4ed8] text-white shadow-sm'
                  : 'text-[#1e293b] hover:bg-[#cbd5e1]'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>사원(학생) 관리</span>
            </button>

            <button
              id="tab-manager-settings"
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#1d4ed8] text-white shadow-sm'
                  : 'text-[#1e293b] hover:bg-[#cbd5e1]'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>설정 · 백업</span>
            </button>
          </div>

          {/* Exit Manager / Return button */}
          <button
            onClick={onExitManager}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl font-bold text-base transition-colors cursor-pointer border border-slate-700"
          >
            <LogOut className="w-4 h-4 text-slate-300" />
            <span>부장님 메뉴 종료</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {activeTab === 'applications' && (
            <ManagerApplications
              applications={appData.applications}
              onUpdateStatus={onUpdateApplicationStatus}
            />
          )}

          {activeTab === 'employees' && (
            <ManagerEmployees
              employees={appData.employees}
              onCreateEmployee={onCreateEmployee}
              onUpdateEmployee={onUpdateEmployee}
              onToggleActive={onToggleActiveEmployee}
              onDeleteEmployee={onDeleteEmployee}
            />
          )}

          {activeTab === 'settings' && (
            <ManagerSettings
              appData={appData}
              onUpdateSettings={onUpdateSettings}
              onRestoreBackup={onRestoreBackup}
              onResetApplications={onResetApplications}
              onResetAllData={onResetAllData}
            />
          )}
        </div>

        {/* Footer Info Notice */}
        <div className="shrink-0 text-center text-slate-500 font-semibold text-sm py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
          부장님 전용 결재 및 시스템 관리 화면입니다.
        </div>
      </div>
    </div>

  );
};
