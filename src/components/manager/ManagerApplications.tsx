import React, { useState, useMemo } from 'react';
import { LeaveApplication, ApplicationStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  Building,
  User,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Pagination } from '../common/Pagination';
import { formatKoreanDate, formatDateTime, getTodayDateString } from '../../services/storage';

interface ManagerApplicationsProps {
  applications: LeaveApplication[];
  onUpdateStatus: (id: string, status: ApplicationStatus, rejectionReason?: string) => void;
}

const ITEMS_PER_PAGE = 5;

const REJECTION_PRESETS = [
  '날짜를 다시 확인하세요.',
  '시간을 다시 확인하세요.',
  '사유를 다시 작성하세요.',
  '근무 상황을 다시 선택하세요.',
  '목적지를 다시 확인하세요.',
  '기타',
];

export const ManagerApplications: React.FC<ManagerApplicationsProps> = ({
  applications,
  onUpdateStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected for viewing / processing
  const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);

  // Approve Confirm Modal
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState<boolean>(false);

  // Reject Flow Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState<string>('');
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string>('');

  // 1. Stats calculation
  const todayStr = getTodayDateString();
  const stats = useMemo(() => {
    let pending = 0;
    let todayCount = 0;
    let approved = 0;
    let rejected = 0;

    applications.forEach((app) => {
      if (app.status === '승인대기') pending++;
      if (app.date === todayStr || app.appliedAt.startsWith(todayStr)) todayCount++;
      if (app.status === '승인') approved++;
      if (app.status === '반려') rejected++;
    });

    return { pending, todayCount, approved, rejected };
  }, [applications, todayStr]);

  // 2. Filter & Sort (Pending first, then newest appliedAt first)
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        if (filterStatus !== '전체' && app.status !== filterStatus) return false;
        if (searchQuery.trim() && !app.employeeName.includes(searchQuery.trim())) return false;
        return true;
      })
      .sort((a, b) => {
        // Pending first
        if (a.status === '승인대기' && b.status !== '승인대기') return -1;
        if (a.status !== '승인대기' && b.status === '승인대기') return 1;
        // Then latest applied
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      });
  }, [applications, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentList = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Summary time display
  const formatDateTimeSummary = (app: LeaveApplication) => {
    const formattedDate = formatKoreanDate(app.date);
    if (app.leaveType === '외출' && app.startTime && app.endTime) {
      return `${formattedDate} (${app.startTime} ~ ${app.endTime})`;
    }
    if ((app.leaveType === '지각' || app.leaveType === '병지각') && app.startTime) {
      return `${formattedDate} (${app.startTime} 출근)`;
    }
    if ((app.leaveType === '조퇴' || app.leaveType === '병조퇴') && app.endTime) {
      return `${formattedDate} (${app.endTime} 퇴근)`;
    }
    return formattedDate;
  };

  // Actions
  const handleApprove = () => {
    if (!selectedApp) return;
    onUpdateStatus(selectedApp.id, '승인');
    setIsApproveConfirmOpen(false);
    setSelectedApp(null);
  };

  const handleOpenReject = () => {
    setSelectedRejectionReason('');
    setCustomRejectionReason('');
    setRejectError('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedApp) return;
    if (!selectedRejectionReason) {
      setRejectError('반려 사유를 선택해 주세요.');
      return;
    }
    if (selectedRejectionReason === '기타' && !customRejectionReason.trim()) {
      setRejectError('기타 반려 사유를 직접 입력해 주세요.');
      return;
    }

    const finalReason =
      selectedRejectionReason === '기타'
        ? customRejectionReason.trim()
        : selectedRejectionReason;

    onUpdateStatus(selectedApp.id, '반려', finalReason);
    setIsRejectModalOpen(false);
    setSelectedApp(null);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 shrink-0">
        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-amber-800">승인대기</span>
            <div className="text-2xl md:text-3xl font-black text-amber-900 mt-0.5">
              {stats.pending}건
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-blue-800">오늘 신청</span>
            <div className="text-2xl md:text-3xl font-black text-[#1e3a8a] mt-0.5">
              {stats.todayCount}건
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-200 text-[#1d4ed8] flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-emerald-800">승인 완료</span>
            <div className="text-2xl md:text-3xl font-black text-emerald-900 mt-0.5">
              {stats.approved}건
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-rose-800">반려</span>
            <div className="text-2xl md:text-3xl font-black text-rose-900 mt-0.5">
              {stats.rejected}건
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 shrink-0 bg-[#f8fafc] p-3 rounded-2xl border-2 border-[#e2e8f0]">
        {/* Status Filter Chips */}
        <div className="flex items-center space-x-2">
          {['전체', '승인대기', '승인', '반려', '취소'].map((st) => (
            <button
              key={st}
              id={`filter-${st}`}
              type="button"
              onClick={() => {
                setFilterStatus(st);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#0f172a] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-manager-search"
            type="text"
            placeholder="사원 이름 검색 (예: 김민준)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-4 bg-white border-2 border-[#cbd5e1] rounded-xl text-base font-bold text-[#1e293b] focus:border-[#1d4ed8] focus:outline-hidden"
          />
        </div>
      </div>

      {/* 3. Table of Applications */}
      <div className="flex-1 my-1 overflow-y-auto flex flex-col justify-start">
        {filteredApplications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center my-auto">
            <Clock className="w-14 h-14 text-slate-300 mb-2" />
            <p className="text-xl font-bold text-slate-700">해당하는 신청 내역이 없습니다.</p>
            <p className="text-slate-500 text-base">필터를 변경하거나 검색어를 확인해 주세요.</p>
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl border-2 border-[#cbd5e1] shadow-xs overflow-hidden flex flex-col">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#0f172a] text-white border-b-2 border-slate-700 h-14 text-lg font-black tracking-wide">
                  <th className="w-[16%] px-5 py-2.5">사원 이름</th>
                  <th className="w-[15%] px-5 py-2.5">근무 상황</th>
                  <th className="w-[30%] px-5 py-2.5">일자 / 시간</th>
                  <th className="w-[24%] px-5 py-2.5">사유</th>
                  <th className="w-[15%] px-5 py-2.5 text-center">처리 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentList.map((app) => (
                  <tr
                    key={app.id}
                    id={`manager-row-${app.id}`}
                    onClick={() => setSelectedApp(app)}
                    className="h-[58px] hover:bg-blue-50/70 active:bg-blue-100 cursor-pointer transition-colors text-lg font-bold text-[#1e293b]"
                  >
                    <td className="px-5 py-2">
                      <span className="font-black text-[#1e293b] flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{app.employeeName}</span>
                      </span>
                    </td>
                    <td className="px-5 py-2">
                      <span className="font-black text-[#1d4ed8]">{app.leaveType}</span>
                    </td>
                    <td className="px-5 py-2 truncate text-slate-800">
                      {formatDateTimeSummary(app)}
                    </td>
                    <td className="px-5 py-2 text-slate-500 truncate">
                      {app.reason}
                    </td>
                    <td className="px-5 py-2 text-center">
                      <StatusBadge status={app.status} size="md" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      <div className="shrink-0 flex justify-center py-2 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] mt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Application Detail & Approval Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`근무 상황 결재 (${selectedApp.employeeName} 사원)`}
          maxWidthClass="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border-2 border-[#e2e8f0]">
              <span className="text-lg font-bold text-slate-600">현재 상태:</span>
              <StatusBadge status={selectedApp.status} size="lg" />
            </div>

            {/* If already rejected, show reason */}
            {selectedApp.status === '반려' && (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl">
                <span className="text-rose-800 font-black text-lg block mb-1">
                  반려 사유:
                </span>
                <p className="text-xl font-bold text-rose-900 bg-white p-3 rounded-xl border border-rose-200">
                  {selectedApp.rejectionReason}
                </p>
              </div>
            )}

            {/* Detailed Content */}
            <div className="bg-[#f8fafc] p-5 rounded-2xl border-2 border-[#e2e8f0] space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-base font-bold text-slate-500">신청 사원</span>
                <span className="text-xl font-black text-[#1e293b]">
                  {selectedApp.employeeName} 사원
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-base font-bold text-slate-500">근무 상황</span>
                <span className="text-xl font-black text-[#1d4ed8]">
                  {selectedApp.leaveType}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-base font-bold text-slate-500">신청 날짜</span>
                <span className="text-xl font-black text-[#1e293b]">
                  {formatKoreanDate(selectedApp.date)}
                </span>
              </div>

              {selectedApp.startTime && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-base font-bold text-slate-500">
                    {selectedApp.leaveType === '외출' ? '외출 시작' : '출근 시간'}
                  </span>
                  <span className="text-xl font-black text-[#1e293b]">
                    {selectedApp.startTime}
                  </span>
                </div>
              )}

              {selectedApp.endTime && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-base font-bold text-slate-500">
                    {selectedApp.leaveType === '외출' ? '복귀 예정' : '퇴근 시간'}
                  </span>
                  <span className="text-xl font-black text-[#1e293b]">
                    {selectedApp.endTime}
                  </span>
                </div>
              )}

              {selectedApp.destination && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-base font-bold text-slate-500">외출 목적지</span>
                  <span className="text-xl font-black text-[#1e293b] flex items-center space-x-1">
                    <Building className="w-4 h-4 text-teal-600" />
                    <span>{selectedApp.destination}</span>
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-base font-bold text-slate-500">신청 사유</span>
                <span className="text-xl font-black text-[#1e293b]">
                  {selectedApp.reason}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-500 text-sm font-semibold">
                <span>신청 접수 일시</span>
                <span>{formatDateTime(selectedApp.appliedAt)}</span>
              </div>
            </div>

            {/* Bottom Actions for Manager */}
            <div className="pt-4 flex items-center justify-between">
              {selectedApp.status === '승인대기' ? (
                <div className="flex items-center space-x-4 w-full justify-between">
                  <button
                    id="btn-manager-reject-open"
                    type="button"
                    onClick={handleOpenReject}
                    className="flex-1 min-h-[50px] px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xl shadow-md border-b-4 border-rose-900 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-6 h-6" />
                    <span>반려</span>
                  </button>

                  <button
                    id="btn-manager-approve-open"
                    type="button"
                    onClick={() => setIsApproveConfirmOpen(true)}
                    className="flex-1 min-h-[50px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xl shadow-md border-b-4 border-emerald-900 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Check className="w-6 h-6" />
                    <span>승인</span>
                  </button>
                </div>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl font-bold text-base transition-colors cursor-pointer border border-slate-700"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Approve Confirmation Modal (Section 22) */}
      {selectedApp && (
        <ConfirmModal
          isOpen={isApproveConfirmOpen}
          onClose={() => setIsApproveConfirmOpen(false)}
          onConfirm={handleApprove}
          title="근무 상황 승인 확인"
          message={`${selectedApp.employeeName} 사원의 ${selectedApp.leaveType} 신청을 승인하시겠습니까?`}
          confirmLabel="승인하기"
          cancelLabel="취소"
          type="success"
        />
      )}

      {/* Reject Reason Selection Modal (Section 23) */}
      {selectedApp && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title={`반려 사유 선택 (${selectedApp.employeeName} 사원)`}
          maxWidthClass="max-w-xl"
        >
          <div className="space-y-4">
            <p className="text-lg font-bold text-[#1e293b]">
              학생에게 전달할 반려 사유를 선택해 주세요.
            </p>

            {rejectError && (
              <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-800 font-bold text-base flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            {/* Presets List */}
            <div className="space-y-2">
              {REJECTION_PRESETS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  id={`btn-reject-reason-${reason}`}
                  onClick={() => {
                    setSelectedRejectionReason(reason);
                    setRejectError('');
                  }}
                  className={`w-full p-3.5 rounded-xl border-2 text-left font-bold text-lg transition-all cursor-pointer flex items-center justify-between ${
                    selectedRejectionReason === reason
                      ? 'bg-rose-50 border-rose-600 text-rose-950 shadow-xs'
                      : 'bg-white border-slate-300 text-[#1e293b] hover:bg-slate-50'
                  }`}
                >
                  <span>{reason}</span>
                  {selectedRejectionReason === reason && (
                    <CheckCircle2 className="w-5 h-5 text-rose-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Input for '기타' */}
            {selectedRejectionReason === '기타' && (
              <div className="pt-2">
                <input
                  id="input-reject-custom-reason"
                  type="text"
                  placeholder="반려 사유를 구체적으로 입력하세요"
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  className="w-full h-12 px-4 bg-white border-2 border-slate-400 rounded-xl text-lg font-bold text-[#1e293b] focus:border-rose-600 focus:outline-hidden"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t-2 border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-5 py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] rounded-xl font-bold text-base transition-colors cursor-pointer"
              >
                취소
              </button>

              <button
                id="btn-confirm-reject-final"
                type="button"
                onClick={handleConfirmReject}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xl shadow-md border-b-4 border-rose-900 transition-colors cursor-pointer"
              >
                반려 확정
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

};
