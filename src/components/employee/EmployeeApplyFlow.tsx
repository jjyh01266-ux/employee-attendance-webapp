import React, { useState } from 'react';
import {
  Employee,
  LeaveType,
  LeaveApplication,
  ApplyStep,
} from '../../types';
import {
  Calendar,
  Clock,
  LogOut,
  Footprints,
  HeartPulse,
  Cross,
  Stethoscope,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  User,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { formatKoreanDate, getTodayDateString } from '../../services/storage';

interface EmployeeApplyFlowProps {
  employee: Employee;
  existingApplications: LeaveApplication[];
  onSubmitApplication: (appData: {
    employeeId: string;
    employeeName: string;
    leaveType: LeaveType;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    destination: string;
  }) => void;
  onGoHome: () => void;
  onGoResults: () => void;
}

const LEAVE_TYPES: {
  type: LeaveType;
  title: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}[] = [
  {
    type: '연차휴가',
    title: '1. 연차휴가',
    desc: '하루 전체 쉬기',
    icon: Calendar,
    color: 'bg-blue-600',
  },
  {
    type: '지각',
    title: '2. 지각',
    desc: '출근 시간보다 늦게 도착',
    icon: Clock,
    color: 'bg-sky-600',
  },
  {
    type: '조퇴',
    title: '3. 조퇴',
    desc: '퇴근 시간보다 일찍 가기',
    icon: LogOut,
    color: 'bg-indigo-600',
  },
  {
    type: '외출',
    title: '4. 외출',
    desc: '근무 중 잠시 나갔다 오기',
    icon: Footprints,
    color: 'bg-teal-600',
  },
  {
    type: '병가',
    title: '5. 병가',
    desc: '아파서 하루 쉬기',
    icon: HeartPulse,
    color: 'bg-rose-600',
  },
  {
    type: '병조퇴',
    title: '6. 병조퇴',
    desc: '아파서 일찍 퇴근하기',
    icon: Cross,
    color: 'bg-red-600',
  },
  {
    type: '병지각',
    title: '7. 병지각',
    desc: '아파서 늦게 출근하기',
    icon: Stethoscope,
    color: 'bg-orange-600',
  },
];

const GENERAL_REASONS = ['병원 방문', '몸이 아픔', '가족 일정', '개인 일정', '기타'];
const SICK_REASONS = ['몸이 아픔', '병원 진료', '치료', '기타'];
const OUTING_DESTINATIONS = ['병원', '은행', '관공서', '집', '기타'];

// Quick touch presets for common time selections
const COMMON_TIMES = [
  '09:30', '10:00', '10:30', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export const EmployeeApplyFlow: React.FC<EmployeeApplyFlowProps> = ({
  employee,
  existingApplications,
  onSubmitApplication,
  onGoHome,
  onGoResults,
}) => {
  const [currentStep, setCurrentStep] = useState<ApplyStep>(1);
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);

  // Form Fields
  const [date, setDate] = useState<string>(getTodayDateString());
  const [startTime, setStartTime] = useState<string>('09:30');
  const [endTime, setEndTime] = useState<string>('14:30');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [customDestination, setCustomDestination] = useState<string>('');

  // Validation state
  const [validationError, setValidationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check if current type is medical/sick related
  const isSickLeave =
    selectedType === '병가' || selectedType === '병조퇴' || selectedType === '병지각';

  const reasonList = isSickLeave ? SICK_REASONS : GENERAL_REASONS;

  // Step 1 -> Step 2
  const handleSelectLeaveType = (type: LeaveType) => {
    setSelectedType(type);
    setSelectedReason('');
    setCustomReason('');
    setSelectedDestination('');
    setCustomDestination('');
    setValidationError('');

    // Set sensible default times based on type
    if (type === '지각' || type === '병지각') {
      setStartTime('10:00');
    } else if (type === '조퇴' || type === '병조퇴') {
      setEndTime('14:30');
    } else if (type === '외출') {
      setStartTime('13:00');
      setEndTime('15:00');
    }

    setCurrentStep(2);
  };

  // Step 2 validation before going to Step 3
  const handleValidateStep2 = () => {
    setValidationError('');

    if (!date) {
      setValidationError('날짜를 선택해 주세요.');
      return;
    }

    if (selectedType === '지각' || selectedType === '병지각') {
      if (!startTime) {
        setValidationError('출근 시간을 선택해 주세요.');
        return;
      }
    }

    if (selectedType === '조퇴' || selectedType === '병조퇴') {
      if (!endTime) {
        setValidationError('퇴근 시간을 선택해 주세요.');
        return;
      }
    }

    if (selectedType === '외출') {
      if (!startTime) {
        setValidationError('나가는 시간을 선택해 주세요.');
        return;
      }
      if (!endTime) {
        setValidationError('돌아오는 시간을 선택해 주세요.');
        return;
      }
      if (endTime <= startTime) {
        setValidationError('돌아오는 시간을 다시 확인해 주세요. (나가는 시간보다 늦어야 합니다)');
        return;
      }
      if (!selectedDestination) {
        setValidationError('목적지를 선택해 주세요.');
        return;
      }
      if (selectedDestination === '기타' && !customDestination.trim()) {
        setValidationError('기타 목적지를 직접 입력해 주세요.');
        return;
      }
    }

    if (!selectedReason) {
      setValidationError('사유를 선택해 주세요.');
      return;
    }
    if (selectedReason === '기타' && !customReason.trim()) {
      setValidationError('기타 사유를 직접 입력해 주세요.');
      return;
    }

    setCurrentStep(3);
  };

  // Determine final reason and destination strings
  const finalReason = selectedReason === '기타' ? customReason.trim() : selectedReason;
  const finalDestination =
    selectedDestination === '기타' ? customDestination.trim() : selectedDestination;

  // Duplicate Check: Same student + same date + same leaveType + status === '승인대기'
  const isDuplicatePending = existingApplications.some(
    (app) =>
      app.employeeId === employee.id &&
      app.date === date &&
      app.leaveType === selectedType &&
      app.status === '승인대기'
  );

  // Submit Handler (Step 3 -> Step 4)
  const handleSubmit = () => {
    if (isSubmitting || !selectedType) return;
    if (isDuplicatePending) {
      setValidationError('이미 같은 날짜에 신청한 근무 상황이 있습니다.');
      return;
    }

    setIsSubmitting(true);

    let submitStartTime = '';
    let submitEndTime = '';

    if (selectedType === '지각' || selectedType === '병지각') {
      submitStartTime = startTime;
    } else if (selectedType === '조퇴' || selectedType === '병조퇴') {
      submitEndTime = endTime;
    } else if (selectedType === '외출') {
      submitStartTime = startTime;
      submitEndTime = endTime;
    }

    onSubmitApplication({
      employeeId: employee.id,
      employeeName: employee.name,
      leaveType: selectedType,
      date,
      startTime: submitStartTime,
      endTime: submitEndTime,
      reason: finalReason,
      destination: selectedType === '외출' ? finalDestination : '',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(4);
    }, 200);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-6 max-w-6xl mx-auto">
      {/* High Density Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col h-full justify-between mx-auto">
        {/* 1. Step Indicator Header */}
        <div className="shrink-0 bg-[#f8fafc] border-b-2 border-[#e2e8f0] px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-8 bg-[#1d4ed8] rounded-full shrink-0" />
              <span className="px-3 py-1 bg-blue-100 text-[#1e3a8a] rounded-lg font-bold text-base">
                {employee.className} {employee.name} 사원
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1e293b]">
                근무 상황 신청
              </h2>
            </div>

            {currentStep < 4 && (
              <button
                id="btn-apply-cancel-top"
                onClick={onGoHome}
                className="px-4 py-2 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] font-bold rounded-xl text-base transition-colors cursor-pointer"
              >
                신청 취소하고 돌아가기
              </button>
            )}
          </div>

          {/* 4-Step Progress Bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { step: 1, label: '1 근무 상황 선택' },
              { step: 2, label: '2 정보 입력' },
              { step: 3, label: '3 내용 확인' },
              { step: 4, label: '4 신청 완료' },
            ].map((item) => {
              const isCurrent = currentStep === item.step;
              const isCompleted = currentStep > item.step;

              let badgeClass = 'bg-white text-slate-500 border-slate-300';
              if (isCurrent) {
                badgeClass = 'bg-[#1d4ed8] text-white border-[#1e3a8a] shadow-md scale-102';
              } else if (isCompleted) {
                badgeClass = 'bg-emerald-600 text-white border-emerald-700';
              }

              return (
                <div
                  key={item.step}
                  className={`flex items-center justify-center py-2.5 px-3 rounded-xl border-2 text-base md:text-lg font-black transition-all text-center ${badgeClass}`}
                >
                  {isCompleted && <CheckCircle2 className="w-5 h-5 mr-1.5 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Main Content Area per Step */}
        <div className="flex-1 flex flex-col justify-center my-auto overflow-y-auto p-6">
          {/* STEP 1: Select Leave Type (7 items) */}
          {currentStep === 1 && (
            <div className="w-full flex flex-col justify-center items-center">
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight">
                  어떤 근무 상황을 신청하시겠습니까?
                </h3>
                <p className="text-lg text-slate-500 font-semibold mt-1">
                  아래 7개 항목 중 해당하는 복무 카드를 눌러주세요.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {LEAVE_TYPES.map((lt) => {
                  const IconComp = lt.icon;
                  return (
                    <button
                      key={lt.type}
                      id={`btn-leave-type-${lt.type}`}
                      onClick={() => handleSelectLeaveType(lt.type)}
                      className="group flex flex-col items-center justify-center p-5 bg-white hover:bg-blue-50/80 active:bg-blue-100 rounded-2xl border-2 border-slate-300 hover:border-[#1d4ed8] shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[135px] focus:outline-hidden focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-1"
                    >
                      <div
                        className={`w-13 h-13 rounded-xl ${lt.color} text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-105 transition-transform border-b-2 border-black/20`}
                      >
                        <IconComp className="w-7 h-7" />
                      </div>
                      <span className="text-2xl font-black text-[#1e293b] tracking-tight">
                        {lt.type}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 mt-0.5">
                        {lt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Input Information */}
          {currentStep === 2 && selectedType && (
            <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
              {/* Header with Type Badge */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-1.5 bg-[#1d4ed8] text-white rounded-xl text-xl font-black border-b-2 border-[#1e3a8a]">
                    {selectedType}
                  </span>
                  <span className="text-2xl font-black text-[#1e293b]">
                    정보를 입력해 주세요
                  </span>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-base font-bold text-slate-500 hover:text-[#1d4ed8] underline cursor-pointer"
                >
                  복무 유형 다시 선택
                </button>
              </div>

              {validationError && (
                <div
                  id="validation-error-alert"
                  className="mb-4 p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center space-x-3 text-rose-800 text-lg font-bold"
                >
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Date Input */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-lg font-black text-slate-800 mb-2 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#1d4ed8]" />
                    <span>날짜 선택 (기본값: 오늘)</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="input-apply-date"
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setValidationError('');
                      }}
                      className="h-12 px-4 bg-white border-2 border-slate-300 rounded-xl text-xl font-bold text-slate-900 focus:border-[#1d4ed8] focus:outline-hidden w-full max-w-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setDate(getTodayDateString())}
                      className="h-12 px-4 bg-blue-100 hover:bg-blue-200 text-[#1e3a8a] rounded-xl text-base font-bold transition-colors cursor-pointer"
                    >
                      오늘로 설정
                    </button>
                  </div>
                </div>

                {/* Conditional Time Inputs */}
                {(selectedType === '지각' || selectedType === '병지각') && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-lg font-black text-slate-800 mb-2 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-sky-600" />
                      <span>출근 예상 시간</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          id="input-apply-start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            setValidationError('');
                          }}
                          className="h-12 px-4 bg-white border-2 border-slate-300 rounded-xl text-xl font-bold text-slate-900 focus:border-[#1d4ed8] focus:outline-hidden w-44"
                        />
                        <span className="text-lg font-bold text-slate-600">출근 예정</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {['09:30', '10:00', '10:30', '11:00', '13:00'].map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setStartTime(time)}
                            className={`px-3 py-1 rounded-lg border-2 text-sm font-bold transition-all cursor-pointer ${
                              startTime === time
                                ? 'bg-sky-600 text-white border-sky-700'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(selectedType === '조퇴' || selectedType === '병조퇴') && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-lg font-black text-slate-800 mb-2 flex items-center space-x-2">
                      <LogOut className="w-5 h-5 text-indigo-600" />
                      <span>퇴근 예정 시간</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          id="input-apply-end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                            setValidationError('');
                          }}
                          className="h-12 px-4 bg-white border-2 border-slate-300 rounded-xl text-xl font-bold text-slate-900 focus:border-[#1d4ed8] focus:outline-hidden w-44"
                        />
                        <span className="text-lg font-bold text-slate-600">퇴근 예정</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {['13:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setEndTime(time)}
                            className={`px-3 py-1 rounded-lg border-2 text-sm font-bold transition-all cursor-pointer ${
                              endTime === time
                                ? 'bg-indigo-600 text-white border-indigo-700'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === '외출' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-lg font-black text-slate-800 flex items-center space-x-2">
                      <Footprints className="w-5 h-5 text-teal-600" />
                      <span>외출 시간 (나가는 시간 ~ 돌아오는 시간)</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-base font-bold text-slate-700 mb-1">
                          1) 나가는 시간
                        </span>
                        <input
                          id="input-apply-outing-start"
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            setValidationError('');
                          }}
                          className="h-12 px-4 bg-white border-2 border-slate-300 rounded-xl text-xl font-bold text-slate-900 focus:border-[#1d4ed8] focus:outline-hidden w-full"
                        />
                      </div>

                      <div>
                        <span className="block text-base font-bold text-slate-700 mb-1">
                          2) 돌아오는 시간
                        </span>
                        <input
                          id="input-apply-outing-end"
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                            setValidationError('');
                          }}
                          className="h-12 px-4 bg-white border-2 border-slate-300 rounded-xl text-xl font-bold text-slate-900 focus:border-[#1d4ed8] focus:outline-hidden w-full"
                        />
                      </div>
                    </div>

                    {/* Destination Selection (외출만) */}
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-lg font-black text-slate-800 mb-2 flex items-center space-x-2">
                        <Building className="w-5 h-5 text-teal-600" />
                        <span>목적지 선택</span>
                      </label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {OUTING_DESTINATIONS.map((dest) => (
                          <button
                            key={dest}
                            type="button"
                            id={`btn-dest-${dest}`}
                            onClick={() => {
                              setSelectedDestination(dest);
                              setValidationError('');
                            }}
                            className={`min-h-[44px] px-5 py-2 rounded-xl border-2 text-lg font-bold transition-all cursor-pointer ${
                              selectedDestination === dest
                                ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {dest}
                          </button>
                        ))}
                      </div>

                      {selectedDestination === '기타' && (
                        <input
                          id="input-dest-custom"
                          type="text"
                          placeholder="목적지를 직접 입력해 주세요 (예: 주민센터, 안과)"
                          value={customDestination}
                          onChange={(e) => setCustomDestination(e.target.value)}
                          className="h-12 px-4 bg-white border-2 border-slate-400 rounded-xl text-lg font-bold text-slate-900 w-full focus:border-teal-600 focus:outline-hidden"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Reason Selection */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-lg font-black text-slate-800 mb-2 flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-[#1d4ed8]" />
                    <span>신청 사유 선택</span>
                  </label>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {reasonList.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        id={`btn-reason-${reason}`}
                        onClick={() => {
                          setSelectedReason(reason);
                          setValidationError('');
                        }}
                        className={`min-h-[46px] px-5 py-2 rounded-xl border-2 text-lg font-bold transition-all cursor-pointer ${
                          selectedReason === reason
                            ? 'bg-[#1d4ed8] text-white border-[#1e3a8a] shadow-sm'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  {selectedReason === '기타' && (
                    <input
                      id="input-reason-custom"
                      type="text"
                      placeholder="사유를 직접 입력해 주세요 (예: 치과 진료, 독감 휴식)"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="h-12 px-4 bg-white border-2 border-slate-400 rounded-xl text-lg font-bold text-slate-900 w-full focus:border-[#1d4ed8] focus:outline-hidden"
                    />
                  )}
                </div>
              </div>

              {/* Bottom Step 2 Action Buttons */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-2 px-5 py-3 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] rounded-xl font-bold text-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>이전 단계</span>
                </button>

                <button
                  type="button"
                  id="btn-apply-step2-next"
                  onClick={handleValidateStep2}
                  className="flex items-center space-x-3 px-8 py-3 bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-[#1e3a8a] text-white rounded-xl font-black text-xl shadow-md border-b-4 border-[#1e3a8a] transition-all cursor-pointer"
                >
                  <span>다음 (내용 확인)</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirm */}
          {currentStep === 3 && selectedType && (
            <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
              <div className="text-center mb-5">
                <span className="inline-block px-4 py-1 bg-amber-100 border border-amber-300 text-amber-900 font-bold text-base rounded-full mb-1">
                  STEP 3 확인
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight">
                  신청 내용을 확인해 주세요
                </h3>
                <p className="text-lg text-slate-500 font-semibold mt-0.5">
                  내용이 맞는지 확인한 후 아래 [신청하기] 버튼을 눌러주세요.
                </p>
              </div>

              {/* Duplicate warning if exists */}
              {isDuplicatePending && (
                <div className="mb-5 p-4 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center space-x-3 text-rose-900 text-lg font-bold">
                  <AlertCircle className="w-7 h-7 text-rose-600 shrink-0" />
                  <div>
                    <p className="font-black">이미 같은 날짜에 신청한 근무 상황이 있습니다.</p>
                    <p className="text-sm font-semibold text-rose-700">
                      부장님의 결재를 기다리거나, 신청 결과를 확인해 주세요.
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Review Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3 text-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">신청자</span>
                  <span className="font-black text-[#1e293b] flex items-center space-x-2">
                    <User className="w-5 h-5 text-[#1d4ed8]" />
                    <span>
                      {employee.name} 사원 ({employee.className})
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">근무 상황</span>
                  <span className="font-black text-[#1d4ed8] bg-blue-100 px-3 py-0.5 rounded-md">
                    {selectedType}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">신청 일자</span>
                  <span className="font-black text-[#1e293b]">
                    {formatKoreanDate(date)}
                  </span>
                </div>

                {/* Times */}
                {(selectedType === '지각' || selectedType === '병지각') && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500">출근 시간</span>
                    <span className="font-black text-[#1e293b]">{startTime}</span>
                  </div>
                )}

                {(selectedType === '조퇴' || selectedType === '병조퇴') && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-500">퇴근 시간</span>
                    <span className="font-black text-[#1e293b]">{endTime}</span>
                  </div>
                )}

                {selectedType === '외출' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500">외출 시간</span>
                      <span className="font-black text-[#1e293b]">
                        {startTime} ~ {endTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500">목적지</span>
                      <span className="font-black text-[#1e293b]">
                        {finalDestination}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">사유</span>
                  <span className="font-black text-[#1e293b]">{finalReason}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-2 px-5 py-3 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] rounded-xl font-bold text-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>이전으로 (수정)</span>
                </button>

                <button
                  type="button"
                  id="btn-apply-submit-final"
                  disabled={isSubmitting || isDuplicatePending}
                  onClick={handleSubmit}
                  className={`flex items-center space-x-3 px-8 py-3.5 rounded-xl font-black text-xl shadow-md transition-all cursor-pointer ${
                    isDuplicatePending
                      ? 'bg-slate-400 text-white cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-b-4 border-emerald-800 transform hover:scale-102'
                  }`}
                >
                  <Sparkles className="w-6 h-6" />
                  <span>{isSubmitting ? '신청 처리 중...' : '신청하기'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Application Completed */}
          {currentStep === 4 && (
            <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-lg text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <h3 className="text-3xl font-black text-[#1e293b] tracking-tight mb-2">
                신청이 완료되었습니다!
              </h3>

              <p className="text-xl font-bold text-slate-500 mb-5">
                부장님의 승인을 기다려 주세요.
              </p>

              <div className="my-5">
                <StatusBadge status="승인대기" size="lg" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
                <button
                  id="btn-apply-done-to-home"
                  onClick={onGoHome}
                  className="h-14 px-5 bg-[#0f172a] hover:bg-slate-900 text-white rounded-xl font-black text-xl shadow-md transition-all cursor-pointer border-b-4 border-black"
                >
                  사원 메인으로
                </button>

                <button
                  id="btn-apply-done-to-results"
                  onClick={onGoResults}
                  className="h-14 px-5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl font-black text-xl shadow-md transition-all cursor-pointer border-b-4 border-[#1e3a8a]"
                >
                  신청 결과 확인하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info for Accessibility */}
        <div className="shrink-0 text-center text-slate-500 font-bold text-base py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
          진행 단계에 맞춰 큰 버튼을 순서대로 눌러주세요.
        </div>
      </div>
    </div>

  );
};
