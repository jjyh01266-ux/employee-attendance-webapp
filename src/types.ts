export type LeaveType = 
  | '연차휴가'
  | '지각'
  | '조퇴'
  | '외출'
  | '병가'
  | '병조퇴'
  | '병지각';

export type ApplicationStatus = '승인대기' | '승인' | '반려' | '취소';

export interface Employee {
  id: string;
  name: string;
  className: string;
  number: number;
  active: boolean;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm or empty
  endTime: string; // HH:mm or empty
  reason: string;
  destination: string; // Used for '외출'
  status: ApplicationStatus;
  appliedAt: string; // ISO date string or formatted date
  processedAt: string; // ISO date string or empty
  rejectionReason: string; // Reason if rejected
}

export interface AppSettings {
  managerPin: string; // Default '1234' or hashed
  companyName: string; // Default '개인 근무 상황 관리 사이트'
}

export interface AppData {
  version: 1;
  employees: Employee[];
  applications: LeaveApplication[];
  settings: AppSettings;
}

export type AppView = 
  | 'HOME'
  | 'EMPLOYEE_SELECT'
  | 'EMPLOYEE_HOME'
  | 'EMPLOYEE_APPLY'
  | 'EMPLOYEE_RESULTS'
  | 'MANAGER_AUTH'
  | 'MANAGER_DASHBOARD';

export type ManagerSubTab = 'applications' | 'employees' | 'settings';

export type ApplyStep = 1 | 2 | 3 | 4;

export interface ApplicationDraft {
  leaveType: LeaveType | null;
  date: string;
  startTime: string;
  endTime: string;
  reasonCategory: string;
  customReason: string;
  destinationCategory: string;
  customDestination: string;
}
