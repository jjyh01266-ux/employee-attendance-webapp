import React from 'react';
import { Employee, LeaveApplication } from '../../types';
import { FileText, ClipboardList, ArrowLeft, UserCircle2, Clock, Sparkles } from 'lucide-react';

interface EmployeeHomeProps {
  employee: Employee;
  applications: LeaveApplication[];
  onGoApply: () => void;
  onGoResults: () => void;
  onChangeEmployee: () => void;
}

export const EmployeeHome: React.FC<EmployeeHomeProps> = ({
  employee,
  applications,
  onGoApply,
  onGoResults,
  onChangeEmployee,
}) => {
  // Compute pending applications for this student to give immediate contextual awareness
  const myApplications = applications.filter((app) => app.employeeId === employee.id);
  const pendingCount = myApplications.filter((app) => app.status === '승인대기').length;
  const approvedCount = myApplications.filter((app) => app.status === '승인').length;

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-center items-center p-6 max-w-6xl mx-auto">
      {/* High Density Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col h-full justify-between">
        {/* Card Header */}
        <div className="bg-[#f8fafc] border-b-2 border-[#e2e8f0] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <button
              id="btn-change-employee"
              onClick={onChangeEmployee}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-slate-300 text-[#1e293b] rounded-xl font-bold text-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>다른 사원 선택</span>
            </button>

            <div className="w-3 h-8 bg-[#1d4ed8] rounded-full shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl md:text-3xl font-black text-[#1e293b]">
                  {employee.name} 사원
                </span>
                <span className="px-3 py-0.5 bg-blue-100 text-[#1e3a8a] text-base font-bold rounded-lg">
                  {employee.className} {employee.number}번
                </span>
              </div>
              <p className="text-base text-slate-500 font-semibold mt-0.5">
                오늘도 즐거운 직장체험 되세요! 원하시는 메뉴를 선택해 주세요.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
            <UserCircle2 className="w-6 h-6 text-[#1d4ed8]" />
            <span className="text-base font-bold text-[#1d4ed8]">사원 로그인 중</span>
          </div>
        </div>

        {/* 2 Main Action Cards */}
        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
          {/* Apply Card */}
          <button
            id="btn-employee-go-apply"
            onClick={onGoApply}
            className="group relative flex flex-col items-center justify-between p-8 md:p-10 bg-white hover:bg-blue-50/70 active:bg-blue-100 rounded-3xl border-3 border-[#1d4ed8] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer text-left focus:outline-hidden focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-1 min-h-[280px]"
          >
            <div className="w-full flex flex-col items-center text-center">
              <div className="w-22 h-22 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-lg mb-5 group-hover:scale-105 transition-transform border-b-4 border-[#1e3a8a]">
                <FileText className="w-12 h-12" />
              </div>

              <span className="inline-block px-4 py-1 bg-blue-100 text-[#1e3a8a] font-black rounded-lg text-lg mb-2">
                신규 신청
              </span>

              <h3 className="text-3xl md:text-4xl font-black text-[#1e293b] tracking-tight mb-2">
                근무 상황 신청하기
              </h3>

              <p className="text-lg md:text-xl font-bold text-slate-600">
                조퇴, 외출, 결근, 연차, 생리휴가 신청
              </p>
            </div>

            <div className="mt-6 w-full py-4 px-6 bg-[#1d4ed8] text-white rounded-2xl font-black text-2xl flex items-center justify-center space-x-2 shadow-md group-hover:bg-[#1e40af] border-b-4 border-[#1e3a8a] transition-colors">
              <Sparkles className="w-6 h-6" />
              <span>신청서 작성 시작</span>
            </div>
          </button>

          {/* Results Card */}
          <button
            id="btn-employee-go-results"
            onClick={onGoResults}
            className="group relative flex flex-col items-center justify-between p-8 md:p-10 bg-white hover:bg-slate-50/90 active:bg-slate-100 rounded-3xl border-3 border-slate-400 hover:border-slate-700 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer text-left focus:outline-hidden focus:ring-4 focus:ring-slate-300 transform hover:-translate-y-1 min-h-[280px]"
          >
            <div className="w-full flex flex-col items-center text-center">
              <div className="w-22 h-22 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-lg mb-5 group-hover:scale-105 transition-transform relative border-b-4 border-slate-900">
                <ClipboardList className="w-12 h-12 text-blue-400" />
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-3 py-1 bg-[#ea580c] text-white font-black text-base rounded-full shadow-md animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-slate-200 text-slate-800 font-black rounded-lg text-lg">
                  내역 확인
                </span>
                {pendingCount > 0 ? (
                  <span className="px-3 py-1 bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5] font-black rounded-lg text-base">
                    대기 {pendingCount}건
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[#f0fdf4] text-[#16a34a] border border-[#dcfce7] font-black rounded-lg text-base">
                    승인 {approvedCount}건
                  </span>
                )}
              </div>

              <h3 className="text-3xl md:text-4xl font-black text-[#1e293b] tracking-tight mb-2">
                신청 결과 확인하기
              </h3>

              <p className="text-lg md:text-xl font-bold text-slate-600">
                {pendingCount > 0 ? (
                  <span className="text-[#ea580c] font-black">
                    승인 대기 중인 신청 {pendingCount}건 있음
                  </span>
                ) : (
                  '승인, 반려, 처리 내역 조회'
                )}
              </p>
            </div>

            <div className="mt-6 w-full py-4 px-6 bg-[#0f172a] text-white rounded-2xl font-black text-2xl flex items-center justify-center space-x-2 shadow-md group-hover:bg-slate-900 border-b-4 border-black transition-colors">
              <Clock className="w-6 h-6 text-blue-300" />
              <span>내 신청 내역 보기</span>
            </div>
          </button>
        </div>

        {/* Footer Info Notice */}
        <div className="text-center text-slate-500 font-bold text-base shrink-0 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
          신청서 제출 후 부장님의 결재를 받아야 최종 승인됩니다.
        </div>
      </div>
    </div>
  );
};

