import React from 'react';
import { UserCheck, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface HomeRoleSelectProps {
  onSelectEmployeeRole: () => void;
  onSelectManagerRole: () => void;
}

export const HomeRoleSelect: React.FC<HomeRoleSelectProps> = ({
  onSelectEmployeeRole,
  onSelectManagerRole,
}) => {
  return (
    <div className="flex-1 w-full h-full flex flex-col justify-center items-center px-6 py-4 max-w-6xl mx-auto">
      {/* High Density Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="bg-[#f8fafc] border-b-2 border-[#e2e8f0] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-8 bg-[#1d4ed8] rounded-full shrink-0" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight">
                접속할 역할을 선택해 주세요
              </h2>
              <p className="text-base md:text-lg text-slate-500 font-semibold mt-0.5">
                사원으로서 근무 상황을 신청하거나, 부장님으로서 결재 및 설정을 진행합니다.
              </p>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-50 border border-blue-200 text-[#1d4ed8] rounded-full font-bold text-base">
            <Sparkles className="w-4 h-4 text-[#1d4ed8]" />
            <span>특수교육 직장체험 교실</span>
          </div>
        </div>

        {/* 2 Big Role Cards */}
        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Employee Role Card */}
          <button
            id="btn-role-employee"
            onClick={onSelectEmployeeRole}
            className="group relative flex flex-col items-center justify-between p-8 md:p-10 bg-white hover:bg-blue-50/70 active:bg-blue-100 rounded-3xl border-3 border-[#1d4ed8] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer text-left focus:outline-hidden focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-1"
          >
            <div className="w-full flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-lg mb-5 group-hover:scale-105 transition-transform border-b-4 border-[#1e3a8a]">
                <UserCheck className="w-14 h-14 md:w-16 md:h-16" />
              </div>

              <span className="inline-block px-4 py-1 bg-blue-100 text-[#1e3a8a] font-black rounded-lg text-lg mb-2">
                학생용 모드
              </span>

              <h3 className="text-3xl md:text-4xl font-black text-[#1e293b] tracking-tight mb-2">
                사원 화면
              </h3>

              <p className="text-xl md:text-2xl font-bold text-slate-600 leading-relaxed">
                근무 상황 신청 · 결과 확인
              </p>
            </div>

            <div className="mt-8 w-full py-4 px-6 bg-[#1d4ed8] text-white rounded-2xl font-black text-2xl flex items-center justify-center space-x-3 shadow-md group-hover:bg-[#1e40af] border-b-4 border-[#1e3a8a] transition-colors">
              <span>사원 시작하기</span>
              <ArrowRight className="w-7 h-7" />
            </div>
          </button>

          {/* Manager Role Card */}
          <button
            id="btn-role-manager"
            onClick={onSelectManagerRole}
            className="group relative flex flex-col items-center justify-between p-8 md:p-10 bg-white hover:bg-slate-50/90 active:bg-slate-100 rounded-3xl border-3 border-slate-700 hover:border-slate-900 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer text-left focus:outline-hidden focus:ring-4 focus:ring-slate-300 transform hover:-translate-y-1"
          >
            <div className="w-full flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-lg mb-5 group-hover:scale-105 transition-transform border-b-4 border-slate-900">
                <ShieldCheck className="w-14 h-14 md:w-16 md:h-16 text-blue-400" />
              </div>

              <span className="inline-block px-4 py-1 bg-slate-200 text-slate-800 font-black rounded-lg text-lg mb-2">
                교사용 / 관리자 모드
              </span>

              <h3 className="text-3xl md:text-4xl font-black text-[#1e293b] tracking-tight mb-2">
                부장님 화면
              </h3>

              <p className="text-xl md:text-2xl font-bold text-slate-600 leading-relaxed">
                신청 내역 승인 · 반려 · 사원 관리
              </p>
            </div>

            <div className="mt-8 w-full py-4 px-6 bg-[#0f172a] text-white rounded-2xl font-black text-2xl flex items-center justify-center space-x-3 shadow-md group-hover:bg-slate-900 border-b-4 border-black transition-colors">
              <span>부장님 결재하기</span>
              <ArrowRight className="w-7 h-7 text-blue-300" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

