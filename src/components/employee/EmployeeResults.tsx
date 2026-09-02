import React, { useState } from 'react';
import { Employee, LeaveApplication } from '../../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  PlusCircle,
  Building,
  User,
  XCircle,
  Ban,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Pagination } from '../common/Pagination';
import { formatKoreanDate, formatDateTime } from '../../services/storage';

interface EmployeeResultsProps {
  employee: Employee;
  applications: LeaveApplication[];
  onCancelApplication: (applicationId: string) => void;
  onGoBack: () => void;
  onGoApply: () => void;
}

const ITEMS_PER_PAGE = 5;

export const EmployeeResults: React.FC<EmployeeResultsProps> = ({
  employee,
  applications,
  onCancelApplication,
  onGoBack,
  onGoApply,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  // Filter only current student's records & sort latest first
  const myApplications = applications
    .filter((app) => app.employeeId === employee.id)
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  const totalPages = Math.ceil(myApplications.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentList = myApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format date and time for summary table cell
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

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-6 max-w-7xl mx-auto">
      {/* High Density Main Card Container */}
      <div className="w-full bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col h-full justify-between">
        {/* 1. Header Bar */}
        <div className="bg-[#f8fafc] border-b-2 border-[#e2e8f0] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={onGoBack}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-slate-300 text-[#1e293b] rounded-xl font-bold text-base transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>사원 메인</span>
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight flex items-center space-x-3">
                <div className="w-3 h-8 bg-[#1d4ed8] rounded-full shrink-0" />
                <span>{employee.name} 사원의 신청 결과</span>
              </h2>
              <p className="text-base font-semibold text-slate-500 mt-0.5 ml-6">
                목록을 누르면 상세 내용과 결재 결과를 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            onClick={onGoApply}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl font-bold text-lg transition-all shadow-md border-b-4 border-[#1e3a8a] cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>새 근무 상황 신청</span>
          </button>
        </div>

        {/* 2. Table Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-start">
          {myApplications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center my-auto">
              <Calendar className="w-16 h-16 text-slate-300 mb-3" />
              <h3 className="text-2xl md:text-3xl font-black text-slate-700 mb-1">
                아직 신청한 근무 상황이 없습니다
              </h3>
              <p className="text-lg text-slate-500 mb-5 font-medium">
                새로운 복무(연차, 조퇴, 지각 등)를 신청해 보세요.
              </p>
              <button
                onClick={onGoApply}
                className="px-6 py-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl font-black text-xl shadow-md border-b-4 border-[#1e3a8a] cursor-pointer transition-transform hover:scale-105"
              >
                근무 상황 신청하기
              </button>
            </div>
          ) : (
            <div className="w-full bg-white rounded-2xl border-2 border-[#cbd5e1] shadow-sm overflow-hidden flex flex-col">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#0f172a] text-white border-b-2 border-slate-700 h-14 text-lg font-black tracking-wide">
                    <th className="w-[18%] px-5 py-3">신청일</th>
                    <th className="w-[16%] px-5 py-3">근무 상황</th>
                    <th className="w-[32%] px-5 py-3">일자 / 시간</th>
                    <th className="w-[20%] px-5 py-3">사유</th>
                    <th className="w-[14%] px-5 py-3 text-center">처리 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentList.map((app) => (
                    <tr
                      key={app.id}
                      id={`row-app-${app.id}`}
                      onClick={() => setSelectedApp(app)}
                      className="h-[60px] hover:bg-blue-50/70 active:bg-blue-100 cursor-pointer transition-colors text-lg font-bold text-[#1e293b]"
                    >
                      <td className="px-5 py-2 text-slate-500 font-semibold truncate">
                        {formatDateTime(app.appliedAt).split(' ')[0]}
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

        {/* 3. Pagination */}
        <div className="shrink-0 flex justify-center py-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>


      {/* Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`근무 상황 신청서 상세 (${selectedApp.leaveType})`}
          maxWidthClass="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Status Highlight Banner */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-300">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-600">결재 상태:</span>
              </div>
              <StatusBadge status={selectedApp.status} size="lg" />
            </div>

            {/* Rejection Notice if rejected */}
            {selectedApp.status === '반려' && (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl">
                <div className="flex items-center space-x-2 text-rose-800 font-black text-xl mb-1">
                  <XCircle className="w-6 h-6 text-rose-600" />
                  <span>반려 사유 안내</span>
                </div>
                <p className="text-2xl font-bold text-rose-900 bg-white p-3 rounded-xl border border-rose-200">
                  {selectedApp.rejectionReason || '사유가 기재되지 않았습니다.'}
                </p>
                <p className="text-base font-semibold text-rose-700 mt-2">
                  부장님의 안내에 따라 내용을 수정한 뒤 다시 신청해 주세요.
                </p>
              </div>
            )}

            {/* Information Grid */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-lg font-bold text-slate-500">신청자</span>
                <span className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>{selectedApp.employeeName} 사원</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-lg font-bold text-slate-500">근무 상황</span>
                <span className="text-2xl font-black text-blue-700">
                  {selectedApp.leaveType}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-lg font-bold text-slate-500">신청 일자</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatKoreanDate(selectedApp.date)}
                </span>
              </div>

              {selectedApp.startTime && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-lg font-bold text-slate-500">
                    {selectedApp.leaveType === '외출' ? '외출 시작 시간' : '출근 시간'}
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    {selectedApp.startTime}
                  </span>
                </div>
              )}

              {selectedApp.endTime && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-lg font-bold text-slate-500">
                    {selectedApp.leaveType === '외출' ? '복귀 예정 시간' : '퇴근 시간'}
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    {selectedApp.endTime}
                  </span>
                </div>
              )}

              {selectedApp.destination && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-lg font-bold text-slate-500">외출 목적지</span>
                  <span className="text-2xl font-black text-slate-900 flex items-center space-x-1">
                    <Building className="w-5 h-5 text-teal-600" />
                    <span>{selectedApp.destination}</span>
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-lg font-bold text-slate-500">신청 사유</span>
                <span className="text-2xl font-black text-slate-900">
                  {selectedApp.reason}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-500 text-base font-semibold">
                <span>신청 일시</span>
                <span>{formatDateTime(selectedApp.appliedAt)}</span>
              </div>

              {selectedApp.processedAt && (
                <div className="flex justify-between items-center py-1 text-slate-500 text-base font-semibold">
                  <span>결재 처리 일시</span>
                  <span>{formatDateTime(selectedApp.processedAt)}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex items-center justify-between">
              {/* Cancel Button only for '승인대기' status (Requirement 19) */}
              {selectedApp.status === '승인대기' ? (
                <button
                  id="btn-cancel-application"
                  type="button"
                  onClick={() => setCancelTargetId(selectedApp.id)}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border-2 border-rose-300 rounded-xl font-black text-xl transition-colors cursor-pointer"
                >
                  <Ban className="w-6 h-6 text-rose-600" />
                  <span>신청 취소하기</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        onConfirm={() => {
          if (cancelTargetId) {
            onCancelApplication(cancelTargetId);
            setCancelTargetId(null);
            setSelectedApp(null);
          }
        }}
        title="신청 취소 확인"
        message="이 신청을 취소하시겠습니까?"
        subMessage="취소된 신청은 [취소] 상태로 보관되며, 필요시 다시 신청할 수 있습니다."
        confirmLabel="신청 취소"
        cancelLabel="아니요"
        type="warning"
      />
    </div>
  );
};
