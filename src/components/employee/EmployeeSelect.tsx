import React, { useState } from 'react';
import { Employee } from '../../types';
import { User, ArrowLeft, Users } from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface EmployeeSelectProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 6;

export const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  employees,
  onSelectEmployee,
  onBack,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const activeEmployees = employees.filter((e) => e.active !== false);
  const totalPages = Math.ceil(activeEmployees.length / ITEMS_PER_PAGE) || 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEmployees = activeEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-center items-center p-6 max-w-6xl mx-auto">
      {/* High Density Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col h-full justify-between">
        {/* Card Header */}
        <div className="bg-[#f8fafc] border-b-2 border-[#e2e8f0] px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-slate-300 text-[#1e293b] rounded-xl font-bold text-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>이전</span>
            </button>

            <div className="w-3 h-8 bg-[#1d4ed8] rounded-full shrink-0" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight flex items-center space-x-2">
                <span>사원을 선택해 주세요</span>
              </h2>
              <p className="text-base text-slate-500 font-semibold mt-0.5">
                본인의 이름과 학급 카드를 터치(클릭)하여 근무 상황을 신청합니다.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
              총 <strong className="text-[#1d4ed8] font-black">{activeEmployees.length}</strong>명 등록됨
            </span>
          </div>
        </div>

        {/* Grid of Big Employee Cards */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          {activeEmployees.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 w-full max-w-lg">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-slate-700 mb-2">등록된 사원이 없습니다.</p>
              <p className="text-slate-500 text-lg">부장님 화면에서 사원을 먼저 추가해 주세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {currentEmployees.map((emp) => (
                <button
                  key={emp.id}
                  id={`btn-select-emp-${emp.id}`}
                  onClick={() => onSelectEmployee(emp)}
                  className="group p-6 bg-white hover:bg-blue-50/80 active:bg-blue-100 rounded-2xl border-2 border-[#cbd5e1] hover:border-[#1d4ed8] shadow-sm hover:shadow-lg transition-all duration-150 cursor-pointer flex flex-col items-center justify-center text-center transform hover:-translate-y-1 focus:outline-hidden focus:ring-4 focus:ring-blue-300 min-h-[140px]"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 bg-slate-100 group-hover:bg-blue-200 text-slate-700 group-hover:text-blue-900 rounded-md font-bold text-base">
                      {emp.className}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-200 group-hover:bg-blue-300 text-slate-800 group-hover:text-blue-950 rounded-md font-bold text-base">
                      {emp.number}번
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-[#1d4ed8] text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform border-b-2 border-[#1e3a8a]">
                      <User className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black text-[#1e293b] tracking-tight">
                      {emp.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Pagination */}
        <div className="shrink-0 flex justify-center pb-4 pt-1 bg-[#f8fafc] border-t border-[#e2e8f0]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

