import { useState, useEffect, useCallback } from 'react';
import {
  AppData,
  Employee,
  LeaveApplication,
  AppSettings,
  ApplicationStatus,
  AppView,
  LeaveType,
} from './types';
import {
  loadAppData,
  saveAppData,
  generateUUID,
  getInitialData,
  validateBackup,
} from './services/storage';
import { Header } from './components/common/Header';
import { HomeRoleSelect } from './components/HomeRoleSelect';
import { EmployeeSelect } from './components/employee/EmployeeSelect';
import { EmployeeHome } from './components/employee/EmployeeHome';
import { EmployeeApplyFlow } from './components/employee/EmployeeApplyFlow';
import { EmployeeResults } from './components/employee/EmployeeResults';
import { ManagerAuth } from './components/manager/ManagerAuth';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { Modal } from './components/common/Modal';
import { AlertTriangle, RotateCcw, Upload } from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => {
    const { data } = loadAppData();
    return data;
  });
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isDataCorrupted, setIsDataCorrupted] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<AppView>('HOME');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Load initial data from localStorage on mount and check corruption
  useEffect(() => {
    const { data, isCorrupted } = loadAppData();
    if (data) {
      setAppData(data);
    }
    if (isCorrupted) {
      setIsDataCorrupted(true);
    }
    setIsDataLoaded(true);
  }, []);

  // Sync state changes to localStorage
  const updateAndPersistData = useCallback((newData: AppData) => {
    setAppData(newData);
    saveAppData(newData);
  }, []);

  // Header Title mapping based on current view
  const getRoleTitle = (): string => {
    switch (currentView) {
      case 'HOME':
        return 'HOME';
      case 'EMPLOYEE_SELECT':
        return '사원';
      case 'EMPLOYEE_HOME':
        return selectedEmployee ? `사원 · ${selectedEmployee.name}` : '사원';
      case 'EMPLOYEE_APPLY':
        return '사원 · 근무 상황 신청';
      case 'EMPLOYEE_RESULTS':
        return '사원 · 신청 결과';
      case 'MANAGER_AUTH':
        return '부장님 · 인증';
      case 'MANAGER_DASHBOARD':
        return '부장님 · 근무 상황 관리';
      default:
        return 'HOME';
    }
  };

  // Reset navigation to Home
  const handleGoHome = () => {
    setCurrentView('HOME');
    setSelectedEmployee(null);
  };

  // Employee Flow Handlers
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setCurrentView('EMPLOYEE_HOME');
  };

  const handleCreateApplication = (appDraft: {
    employeeId: string;
    employeeName: string;
    leaveType: LeaveType;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    destination: string;
  }) => {
    const newApp: LeaveApplication = {
      id: generateUUID(),
      employeeId: appDraft.employeeId,
      employeeName: appDraft.employeeName,
      leaveType: appDraft.leaveType,
      date: appDraft.date,
      startTime: appDraft.startTime,
      endTime: appDraft.endTime,
      reason: appDraft.reason,
      destination: appDraft.destination,
      status: '승인대기',
      appliedAt: new Date().toISOString(),
      processedAt: '',
      rejectionReason: '',
    };

    const updatedData: AppData = {
      ...appData,
      applications: [newApp, ...appData.applications],
    };
    updateAndPersistData(updatedData);
  };

  const handleCancelApplication = (applicationId: string) => {
    const updatedApps = appData.applications.map((app) => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: '취소' as ApplicationStatus,
          processedAt: new Date().toISOString(),
        };
      }
      return app;
    });

    const updatedData: AppData = {
      ...appData,
      applications: updatedApps,
    };
    updateAndPersistData(updatedData);
  };

  // Manager Flow Handlers
  const handleUpdateApplicationStatus = (
    id: string,
    status: ApplicationStatus,
    rejectionReason?: string
  ) => {
    const updatedApps = appData.applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          status,
          processedAt: new Date().toISOString(),
          rejectionReason: rejectionReason || '',
        };
      }
      return app;
    });

    const updatedData: AppData = {
      ...appData,
      applications: updatedApps,
    };
    updateAndPersistData(updatedData);
  };

  const handleCreateEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: generateUUID(),
    };
    const updatedData: AppData = {
      ...appData,
      employees: [...appData.employees, newEmp],
    };
    updateAndPersistData(updatedData);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const updatedList = appData.employees.map((emp) =>
      emp.id === updatedEmp.id ? updatedEmp : emp
    );
    // Also update any future display cache if needed, but ID remains primary key
    const updatedData: AppData = {
      ...appData,
      employees: updatedList,
    };
    updateAndPersistData(updatedData);

    if (selectedEmployee && selectedEmployee.id === updatedEmp.id) {
      setSelectedEmployee(updatedEmp);
    }
  };

  const handleToggleActiveEmployee = (id: string) => {
    const updatedList = appData.employees.map((emp) =>
      emp.id === id ? { ...emp, active: !emp.active } : emp
    );
    const updatedData: AppData = {
      ...appData,
      employees: updatedList,
    };
    updateAndPersistData(updatedData);
  };

  const handleDeleteEmployee = (id: string) => {
    const updatedList = appData.employees.filter((emp) => emp.id !== id);
    const updatedData: AppData = {
      ...appData,
      employees: updatedList,
    };
    updateAndPersistData(updatedData);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    const updatedData: AppData = {
      ...appData,
      settings: newSettings,
    };
    updateAndPersistData(updatedData);
  };

  const handleRestoreBackup = (backupData: AppData) => {
    updateAndPersistData(backupData);
  };

  const handleResetApplications = () => {
    const updatedData: AppData = {
      ...appData,
      applications: [],
    };
    updateAndPersistData(updatedData);
  };

  const handleResetAllData = () => {
    const initial = getInitialData();
    updateAndPersistData(initial);
    handleGoHome();
  };

  if (!isDataLoaded) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0f172a] text-white font-bold text-2xl">
        시스템을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#f1f5f9] text-[#1e293b] overflow-hidden select-none">
      {/* 1. Global Fixed Top Header */}
      <Header
        companyName={appData.settings.companyName}
        currentRoleTitle={getRoleTitle()}
        onGoHome={handleGoHome}
      />

      {/* 2. Main Body Content Area based on current view */}
      <main className="flex-1 w-full h-[calc(100vh-130px)] overflow-hidden flex flex-col">
        {currentView === 'HOME' && (
          <HomeRoleSelect
            onSelectEmployeeRole={() => setCurrentView('EMPLOYEE_SELECT')}
            onSelectManagerRole={() => setCurrentView('MANAGER_AUTH')}
          />
        )}

        {currentView === 'EMPLOYEE_SELECT' && (
          <EmployeeSelect
            employees={appData.employees}
            onSelectEmployee={handleSelectEmployee}
            onBack={handleGoHome}
          />
        )}

        {currentView === 'EMPLOYEE_HOME' && selectedEmployee && (
          <EmployeeHome
            employee={selectedEmployee}
            applications={appData.applications}
            onGoApply={() => setCurrentView('EMPLOYEE_APPLY')}
            onGoResults={() => setCurrentView('EMPLOYEE_RESULTS')}
            onChangeEmployee={() => setCurrentView('EMPLOYEE_SELECT')}
          />
        )}

        {currentView === 'EMPLOYEE_APPLY' && selectedEmployee && (
          <EmployeeApplyFlow
            employee={selectedEmployee}
            existingApplications={appData.applications}
            onSubmitApplication={handleCreateApplication}
            onGoHome={() => setCurrentView('EMPLOYEE_HOME')}
            onGoResults={() => setCurrentView('EMPLOYEE_RESULTS')}
          />
        )}

        {currentView === 'EMPLOYEE_RESULTS' && selectedEmployee && (
          <EmployeeResults
            employee={selectedEmployee}
            applications={appData.applications}
            onCancelApplication={handleCancelApplication}
            onGoBack={() => setCurrentView('EMPLOYEE_HOME')}
            onGoApply={() => setCurrentView('EMPLOYEE_APPLY')}
          />
        )}

        {currentView === 'MANAGER_AUTH' && (
          <ManagerAuth
            storedPin={appData.settings.managerPin}
            onSuccess={() => setCurrentView('MANAGER_DASHBOARD')}
            onBack={handleGoHome}
          />
        )}

        {currentView === 'MANAGER_DASHBOARD' && (
          <ManagerDashboard
            appData={appData}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onCreateEmployee={handleCreateEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onToggleActiveEmployee={handleToggleActiveEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateSettings={handleUpdateSettings}
            onRestoreBackup={handleRestoreBackup}
            onResetApplications={handleResetApplications}
            onResetAllData={handleResetAllData}
            onExitManager={handleGoHome}
          />
        )}
      </main>

      {/* 3. Global Bottom Status Footer */}
      <footer className="h-[50px] bg-white border-t border-slate-200 flex items-center justify-between px-8 text-slate-500 text-[16px] font-medium shrink-0 z-20">
        <div>
          <span>{appData.settings.companyName} · 특수교육 직장체험 근태·복무 시스템</span>
        </div>
        <div className="flex items-center space-x-6">
          <span>관리자 PIN 기본값: <strong className="text-slate-700 font-bold">1234</strong></span>
          <span className="text-slate-300">|</span>
          <span>버전 1.0.0</span>
        </div>
      </footer>

      {/* Storage Parse Recovery Modal if needed */}
      <Modal
        isOpen={isDataCorrupted}
        onClose={() => setIsDataCorrupted(false)}
        title="데이터 오류 복구 안내"
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-300">
            <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xl font-bold text-amber-900">
                저장된 데이터를 불러오는 중 문제가 발생했습니다.
              </h4>
              <p className="text-base text-amber-800 font-medium mt-1">
                기본 샘플 데이터로 복구하거나 기존 백업 파일을 불러올 수 있습니다.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                handleResetAllData();
                setIsDataCorrupted(false);
              }}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>기본 샘플 데이터로 초기화</span>
            </button>

            <label className="w-full py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>백업 파일 선택하여 복원</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const res = validateBackup(evt.target?.result as string);
                      if (res.valid && res.data) {
                        handleRestoreBackup(res.data);
                        setIsDataCorrupted(false);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
