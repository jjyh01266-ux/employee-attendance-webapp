import React, { useState } from 'react';
import { Employee } from '../../types';
import {
  UserPlus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Pagination } from '../common/Pagination';

interface ManagerEmployeesProps {
  employees: Employee[];
  onCreateEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onToggleActive: (id: string) => void;
  onDeleteEmployee: (id: string) => void;
}

const ITEMS_PER_PAGE = 8;

export const ManagerEmployees: React.FC<ManagerEmployeesProps> = ({
  employees,
  onCreateEmployee,
  onUpdateEmployee,
  onToggleActive,
  onDeleteEmployee,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [name, setName] = useState<string>('');
  const [className, setClassName] = useState<string>('전공2-1');
  const [number, setNumber] = useState<number>(1);
  const [formError, setFormError] = useState<string>('');

  // Delete Confirm Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentList = employees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setClassName('전공2-1');
    // Default next number
    const maxNum = employees.reduce((max, e) => Math.max(max, e.number), 0);
    setNumber(maxNum + 1);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setClassName(emp.className);
    setNumber(emp.number);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setFormError('사원 이름을 입력해 주세요.');
      return;
    }
    if (!className.trim()) {
      setFormError('학급/반을 입력해 주세요.');
      return;
    }
    if (number < 1) {
      setFormError('번호는 1 이상이어야 합니다.');
      return;
    }

    if (editingEmployee) {
      onUpdateEmployee({
        ...editingEmployee,
        name: name.trim(),
        className: className.trim(),
        number: Number(number),
      });
    } else {
      onCreateEmployee({
        name: name.trim(),
        className: className.trim(),
        number: Number(number),
        active: true,
      });
    }

    setIsFormModalOpen(false);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-3 shrink-0 bg-[#f8fafc] p-4 rounded-2xl border-2 border-[#e2e8f0]">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-[#1e293b] tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#1d4ed8]" />
            <span>등록된 사원(학생) 목록</span>
          </h3>
          <p className="text-sm text-slate-500 font-semibold">
            사원의 이름을 수정해도 기존 신청 기록은 고유 ID로 안전하게 보존됩니다.
          </p>
        </div>

        <button
          id="btn-add-employee"
          onClick={openAddModal}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-blue-900 text-white rounded-xl font-bold text-base transition-all shadow-md border-b-4 border-[#1e3a8a] cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          <span>새 사원 추가</span>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 my-1 overflow-y-auto flex flex-col justify-start">
        {employees.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center my-auto">
            <Users className="w-14 h-14 text-slate-300 mb-2" />
            <p className="text-xl font-bold text-slate-700 mb-1">등록된 사원이 없습니다.</p>
            <p className="text-slate-500 text-base">우측 상단 [새 사원 추가] 버튼으로 학생을 등록하세요.</p>
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl border-2 border-[#cbd5e1] shadow-xs overflow-hidden flex flex-col">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#0f172a] text-white border-b-2 border-slate-700 h-14 text-lg font-black tracking-wide">
                  <th className="w-[18%] px-5 py-2.5">학급 (반)</th>
                  <th className="w-[12%] px-5 py-2.5">번호</th>
                  <th className="w-[28%] px-5 py-2.5">사원 이름</th>
                  <th className="w-[18%] px-5 py-2.5 text-center">상태</th>
                  <th className="w-[24%] px-5 py-2.5 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentList.map((emp) => (
                  <tr
                    key={emp.id}
                    id={`row-emp-${emp.id}`}
                    className="h-[58px] hover:bg-slate-50 transition-colors text-lg font-bold text-[#1e293b]"
                  >
                    <td className="px-5 py-2 text-slate-700">{emp.className}</td>
                    <td className="px-5 py-2 text-slate-700">{emp.number}번</td>
                    <td className="px-5 py-2">
                      <span className="font-black text-[#1e293b]">{emp.name}</span>
                    </td>
                    <td className="px-5 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-bold ${
                          emp.active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {emp.active ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            <span>사용 중</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            <span>사용 중지</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Toggle Active Button */}
                        <button
                          type="button"
                          onClick={() => onToggleActive(emp.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-sm transition-colors cursor-pointer border ${
                            emp.active
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                          }`}
                          title={emp.active ? '학생 목록에서 숨김' : '학생 목록에 표시'}
                        >
                          {emp.active ? '중지' : '활성화'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(emp)}
                          className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 rounded-lg font-bold text-sm transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(emp.id)}
                          className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-lg font-bold text-sm transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="shrink-0 flex justify-center py-2 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] mt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEmployee ? '사원(학생) 정보 수정' : '새 사원(학생) 추가'}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-800 font-bold text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-base font-bold text-[#1e293b] mb-1">
              사원 이름 (학생 이름)
            </label>
            <input
              id="input-emp-name"
              type="text"
              placeholder="예: 김민준"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError('');
              }}
              className="w-full h-12 px-4 bg-slate-50 border-2 border-[#cbd5e1] rounded-xl text-xl font-black text-[#1e293b] focus:bg-white focus:border-[#1d4ed8] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-[#1e293b] mb-1">
                학급 / 반
              </label>
              <input
                id="input-emp-class"
                type="text"
                placeholder="예: 전공2-1"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  setFormError('');
                }}
                className="w-full h-12 px-4 bg-slate-50 border-2 border-[#cbd5e1] rounded-xl text-lg font-bold text-[#1e293b] focus:bg-white focus:border-[#1d4ed8] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-[#1e293b] mb-1">
                출석 번호
              </label>
              <input
                id="input-emp-number"
                type="number"
                min={1}
                max={99}
                value={number}
                onChange={(e) => {
                  setNumber(parseInt(e.target.value, 10) || 1);
                  setFormError('');
                }}
                className="w-full h-12 px-4 bg-slate-50 border-2 border-[#cbd5e1] rounded-xl text-lg font-bold text-[#1e293b] focus:bg-white focus:border-[#1d4ed8] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-5 py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] rounded-xl font-bold text-base transition-colors cursor-pointer"
            >
              취소
            </button>

            <button
              id="btn-emp-save"
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl font-black text-lg shadow-md border-b-4 border-[#1e3a8a] transition-colors cursor-pointer"
            >
              저장하기
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteEmployee(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="사원 삭제 확인"
        message="이 사원을 목록에서 완전히 삭제하시겠습니까?"
        subMessage="기존 신청 내역과의 연계를 고려하여, 일시적인 경우 [중지] 처리를 권장합니다."
        confirmLabel="삭제하기"
        cancelLabel="취소"
        isDestructive={true}
      />
    </div>
  );

};
