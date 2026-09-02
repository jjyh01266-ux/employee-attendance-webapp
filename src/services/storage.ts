import { AppData, Employee, LeaveApplication, ApplicationStatus } from '../types';

const STORAGE_KEY = 'workStatusManager_v1';
const LEGACY_STORAGE_KEY = 'work_status_management_data_v1';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback
    }
  }
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// SHA-256 Hash helper using Web Crypto API
export async function hashPin(pin: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode('SALT_WORK_APP_' + pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Crypto subtle failed, fallback hash', e);
    }
  }
  // Simple fallback hash
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return 'fb_' + Math.abs(hash).toString(16);
}

export async function verifyPin(inputPin: string, storedPinHashOrPlain: string): Promise<boolean> {
  // Support both plain default and hashed PIN
  if (inputPin === storedPinHashOrPlain) {
    return true;
  }
  const inputHash = await hashPin(inputPin);
  return inputHash === storedPinHashOrPlain;
}

export const SAMPLE_EMPLOYEES: Employee[] = [
  { id: 'emp_01', name: '김민준', className: '전공2-1', number: 1, active: true },
  { id: 'emp_02', name: '이서연', className: '전공2-1', number: 2, active: true },
  { id: 'emp_03', name: '박지호', className: '전공2-1', number: 3, active: true },
  { id: 'emp_04', name: '한지민', className: '전공2-2', number: 1, active: true },
];

export function getInitialData(): AppData {
  return {
    version: 1,
    employees: SAMPLE_EMPLOYEES,
    applications: [],
    settings: {
      managerPin: '1234',
      companyName: '개인 근무 상황 관리 사이트',
    },
  };
}

export function loadAppData(): { data: AppData; isCorrupted: boolean } {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
      }
    }

    if (!raw) {
      const initial = getInitialData();
      saveAppData(initial);
      return { data: initial, isCorrupted: false };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 1 || !Array.isArray(parsed.employees)) {
      const initial = getInitialData();
      saveAppData(initial);
      return { data: initial, isCorrupted: true };
    }

    // Clean up legacy 6-member sample items if user did not create applications for them
    const cleanedEmployees = (parsed.employees as Employee[]).filter((emp: Employee) => {
      if ((emp.name === '최유진' && (emp.id === 'emp_04' || emp.number === 1)) || 
          (emp.name === '정하늘' && (emp.id === 'emp_05' || emp.number === 2))) {
        const hasApps = Array.isArray(parsed.applications) && parsed.applications.some((app: any) => app.employeeId === emp.id);
        return hasApps; // Keep only if there is real user data attached
      }
      return true;
    });

    const cleanedData: AppData = {
      ...parsed,
      employees: cleanedEmployees,
    };

    saveAppData(cleanedData);
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}

    return { data: cleanedData, isCorrupted: false };
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
    return { data: getInitialData(), isCorrupted: true };
  }
}

export function saveAppData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

export function exportBackup(data: AppData): void {
  const today = new Date().toISOString().split('T')[0];
  const filename = `개인근무상황관리_백업_${today}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateBackup(jsonString: string): { valid: boolean; data?: AppData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'JSON 형식의 데이터가 아닙니다.' };
    }
    if (parsed.version !== 1) {
      return { valid: false, error: '지원되지 않는 버전의 백업 파일입니다 (version: 1 필요).' };
    }
    if (!Array.isArray(parsed.employees) || !Array.isArray(parsed.applications) || !parsed.settings) {
      return { valid: false, error: '백업 파일의 필수 데이터 구조가 누락되었습니다.' };
    }
    return { valid: true, data: parsed as AppData };
  } catch {
    return { valid: false, error: '올바른 백업 파일이 아닙니다.' };
  }
}

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
  }
  return dateStr;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}`;
  } catch {
    return isoString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
