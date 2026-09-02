import React, { useState, useRef } from 'react';
import { AppSettings, AppData } from '../../types';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  KeyRound,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  exportBackup,
  validateBackup,
  verifyPin,
  hashPin,
} from '../../services/storage';

interface ManagerSettingsProps {
  appData: AppData;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreBackup: (backupData: AppData) => void;
  onResetApplications: () => void;
  onResetAllData: () => void;
}

export const ManagerSettings: React.FC<ManagerSettingsProps> = ({
  appData,
  onUpdateSettings,
  onRestoreBackup,
  onResetApplications,
  onResetAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Site name
  const [siteName, setSiteName] = useState<string>(appData.settings.companyName);
  const [siteNameSaved, setSiteNameSaved] = useState<boolean>(false);

  // PIN Change state
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pinSuccess, setPinSuccess] = useState<string>('');

  // Backup restore pending data
  const [pendingRestoreData, setPendingRestoreData] = useState<AppData | null>(null);
  const [restoreErrorMsg, setRestoreErrorMsg] = useState<string>('');

  // Application Reset 2-Step state
  const [isAppResetStep1Open, setIsAppResetStep1Open] = useState<boolean>(false);
  const [isAppResetStep2Open, setIsAppResetStep2Open] = useState<boolean>(false);

  // Full Reset 3-Step state
  const [isFullResetStep1Open, setIsFullResetStep1Open] = useState<boolean>(false);
  const [isFullResetStep2Open, setIsFullResetStep2Open] = useState<boolean>(false);
  const [isFullResetStep3Open, setIsFullResetStep3Open] = useState<boolean>(false);

  // 1. Site Name Update
  const handleSaveSiteName = () => {
    if (!siteName.trim()) return;
    onUpdateSettings({
      ...appData.settings,
      companyName: siteName.trim(),
    });
    setSiteNameSaved(true);
    setTimeout(() => setSiteNameSaved(false), 3000);
  };

  // 2. PIN Change
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (currentPinInput.length !== 4 || newPinInput.length !== 4 || confirmPinInput.length !== 4) {
      setPinError('PIN 번호는 4자리 숫자여야 합니다.');
      return;
    }

    const isCurrentValid = await verifyPin(currentPinInput, appData.settings.managerPin);
    if (!isCurrentValid) {
      setPinError('현재 PIN 번호가 일치하지 않습니다.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError('새 PIN 번호와 확인 번호가 일치하지 않습니다.');
      return;
    }

    const hashed = await hashPin(newPinInput);
    onUpdateSettings({
      ...appData.settings,
      managerPin: hashed,
    });

    setPinSuccess('관리자 PIN 번호가 성공적으로 변경되었습니다.');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setTimeout(() => setPinSuccess(''), 4000);
  };

  // 3. Backup Download
  const handleDownloadBackup = () => {
    exportBackup(appData);
  };

  // 4. Backup File Upload Trigger
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = validateBackup(content);
      if (res.valid && res.data) {
        setPendingRestoreData(res.data);
      } else {
        setRestoreErrorMsg(res.error || '올바른 백업 파일이 아닙니다.');
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto px-1 py-1 space-y-6">
      {/* 1. General & PIN Setting Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Name Setting */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#e2e8f0] shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
            <Building2 className="w-6 h-6 text-[#1d4ed8]" />
            <h3 className="text-xl md:text-2xl font-black text-[#1e293b]">사이트 / 회사명 설정</h3>
          </div>

          <div>
            <label className="block text-base font-bold text-[#1e293b] mb-2">
              표시될 상단 사이트 이름
            </label>
            <input
              id="input-setting-site-name"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border-2 border-[#cbd5e1] rounded-xl text-lg font-bold text-[#1e293b] focus:bg-white focus:border-[#1d4ed8] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {siteNameSaved ? (
              <span className="text-emerald-700 font-bold flex items-center space-x-1 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>저장되었습니다!</span>
              </span>
            ) : (
              <div />
            )}
            <button
              id="btn-save-site-name"
              type="button"
              onClick={handleSaveSiteName}
              className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl font-bold text-base transition-colors cursor-pointer shadow-md border-b-4 border-[#1e3a8a]"
            >
              이름 변경 저장
            </button>
          </div>
        </div>

        {/* PIN Change Form */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#e2e8f0] shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
            <KeyRound className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl md:text-2xl font-black text-[#1e293b]">관리자 PIN 번호 변경</h3>
          </div>

          {pinError && (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-800 font-bold text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          {pinSuccess && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-800 font-bold text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-1">
                  현재 PIN
                </label>
                <input
                  id="input-pin-current"
                  type="password"
                  maxLength={4}
                  placeholder="4자리"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 px-2 text-center bg-slate-50 border-2 border-[#cbd5e1] rounded-xl text-lg font-black text-[#1e293b] focus:bg-white focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-1">
                  새 PIN
                </label>
                <input
                  id="input-pin-new"
                  type="password"
                  maxLength={4}
                  placeholder="4자리"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 px-2 text-center bg-slate-50 border-2 border-[#cbd5e1] rounded-xl text-lg font-black text-[#1e293b] focus:bg-white focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-1">
                  새 PIN 확인
                </label>
                <input
                  id="input-pin-confirm"
                  type="password"
                  maxLength={4}
                  placeholder="4자리"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-11 px-2 text-center bg-slate-50 border-2 border-[#cbd5e1] rounded-xl text-lg font-black text-[#1e293b] focus:bg-white focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                id="btn-change-pin-submit"
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-base transition-colors cursor-pointer shadow-md border-b-4 border-amber-900"
              >
                PIN 번호 변경
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Backup & Restore Card */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#e2e8f0] shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
          <Download className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl md:text-2xl font-black text-[#1e293b]">데이터 백업 및 복원 (JSON)</h3>
        </div>

        <p className="text-base text-slate-600 font-medium">
          브라우저 캐시 초기화나 기기 이동에 대비하여 사원 목록 및 신청 기록 전체를 파일로 저장하거나 다시 불러올 수 있습니다.
        </p>

        {restoreErrorMsg && (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-800 font-bold text-base flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{restoreErrorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export JSON button */}
          <button
            id="btn-backup-export"
            type="button"
            onClick={handleDownloadBackup}
            className="p-5 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border-2 border-teal-500 rounded-2xl flex items-center justify-between transition-colors cursor-pointer text-left"
          >
            <div>
              <span className="block text-xl md:text-2xl font-black text-teal-950">데이터 백업 (다운로드)</span>
              <span className="text-sm font-semibold text-teal-700 mt-1 block">현재 모든 데이터를 JSON 파일로 저장합니다.</span>
            </div>
            <Download className="w-7 h-7 text-teal-700 shrink-0 ml-2" />
          </button>

          {/* Import JSON file input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-backup"
            />
            <button
              id="btn-backup-import-trigger"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-500 rounded-2xl flex items-center justify-between transition-colors cursor-pointer text-left"
            >
              <div>
                <span className="block text-xl md:text-2xl font-black text-blue-950">백업 불러오기 (복원)</span>
                <span className="text-sm font-semibold text-blue-700 mt-1 block">이전에 저장한 JSON 백업 파일을 불러옵니다.</span>
              </div>
              <Upload className="w-7 h-7 text-blue-700 shrink-0 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Dangerous Actions Card: Record Reset & Factory Reset */}
      <div className="bg-rose-50/60 p-6 rounded-3xl border-2 border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-rose-200">
          <Trash2 className="w-6 h-6 text-rose-600" />
          <h3 className="text-xl md:text-2xl font-black text-rose-950">데이터 초기화 영역</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Reset Applications Only */}
          <div className="bg-white p-5 rounded-2xl border-2 border-rose-300 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-black text-[#1e293b] mb-1">
                신청 기록 초기화
              </h4>
              <p className="text-sm text-slate-600 font-medium mb-4">
                사원(학생) 목록과 설정은 유지하고, <strong>모든 복무 신청 기록만 삭제</strong>합니다.
              </p>
            </div>
            <button
              id="btn-reset-applications"
              type="button"
              onClick={() => setIsAppResetStep1Open(true)}
              className="w-full py-2.5 px-4 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-900 border-2 border-rose-400 rounded-xl font-black text-lg transition-colors cursor-pointer"
            >
              신청 기록 초기화 실행
            </button>
          </div>

          {/* Full Factory Reset */}
          <div className="bg-white p-5 rounded-2xl border-2 border-rose-400 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-black text-rose-950 mb-1 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>전체 데이터 초기화</span>
              </h4>
              <p className="text-sm text-slate-600 font-medium mb-4">
                사원 목록, 신청 내역, PIN을 포함한 <strong>모든 데이터를 최초 설치 상태로 리셋</strong>합니다.
              </p>
            </div>
            <button
              id="btn-reset-all-data"
              type="button"
              onClick={() => setIsFullResetStep1Open(true)}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-black text-lg transition-colors cursor-pointer shadow-md border-b-4 border-rose-900"
            >
              전체 데이터 공장초기화
            </button>
          </div>
        </div>
      </div>


      {/* Restore Confirmation Modal */}
      {pendingRestoreData && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setPendingRestoreData(null)}
          onConfirm={() => {
            onRestoreBackup(pendingRestoreData);
            setPendingRestoreData(null);
          }}
          title="백업 데이터 복원 확인"
          message="현재 데이터를 백업 파일의 내용으로 바꾸시겠습니까?"
          subMessage={`복원 대상: 사원 ${pendingRestoreData.employees.length}명, 신청 기록 ${pendingRestoreData.applications.length}건`}
          confirmLabel="복원하기"
          cancelLabel="취소"
          type="warning"
        />
      )}

      {/* 2-Step Applications Reset Confirmations (Section 28) */}
      <ConfirmModal
        isOpen={isAppResetStep1Open}
        onClose={() => setIsAppResetStep1Open(false)}
        onConfirm={() => {
          setIsAppResetStep1Open(false);
          setIsAppResetStep2Open(true);
        }}
        title="신청 기록 초기화 (1단계)"
        message="모든 근무 상황 신청 기록을 삭제하시겠습니까?"
        subMessage="사원 목록과 관리자 설정은 그대로 유지됩니다."
        confirmLabel="다음 확인"
        cancelLabel="취소"
        type="warning"
      />

      <ConfirmModal
        isOpen={isAppResetStep2Open}
        onClose={() => setIsAppResetStep2Open(false)}
        onConfirm={() => {
          onResetApplications();
          setIsAppResetStep2Open(false);
        }}
        title="신청 기록 초기화 (최종 2단계)"
        message="삭제한 기록은 되돌릴 수 없습니다. 계속하시겠습니까?"
        confirmLabel="완전 삭제 실행"
        cancelLabel="취소"
        isDestructive={true}
      />

      {/* 3-Step Full Data Reset Confirmations */}
      <ConfirmModal
        isOpen={isFullResetStep1Open}
        onClose={() => setIsFullResetStep1Open(false)}
        onConfirm={() => {
          setIsFullResetStep1Open(false);
          setIsFullResetStep2Open(true);
        }}
        title="전체 초기화 1차 확인"
        message="모든 사원 목록과 신청 기록, 설정이 삭제됩니다. 계속하시겠습니까?"
        confirmLabel="다음 확인"
        cancelLabel="취소"
        type="warning"
      />

      <ConfirmModal
        isOpen={isFullResetStep2Open}
        onClose={() => setIsFullResetStep2Open(false)}
        onConfirm={() => {
          setIsFullResetStep2Open(false);
          setIsFullResetStep3Open(true);
        }}
        title="전체 초기화 2차 확인"
        message="모든 데이터가 초기 샘플 상태 및 기본 PIN(1234)으로 돌아갑니다."
        confirmLabel="마지막 확인으로"
        cancelLabel="취소"
        type="danger"
      />

      <ConfirmModal
        isOpen={isFullResetStep3Open}
        onClose={() => setIsFullResetStep3Open(false)}
        onConfirm={() => {
          onResetAllData();
          setIsFullResetStep3Open(false);
        }}
        title="전체 데이터 영구 초기화 (3차 최종)"
        message="정말로 모든 데이터를 초기화하시겠습니까?"
        subMessage="이 작업은 영구적이며 취소할 수 없습니다."
        confirmLabel="전체 초기화 실행"
        cancelLabel="취소"
        isDestructive={true}
      />
    </div>
  );
};
