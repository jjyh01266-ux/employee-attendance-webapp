import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Delete, KeyRound, AlertCircle } from 'lucide-react';
import { verifyPin } from '../../services/storage';

interface ManagerAuthProps {
  storedPin: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const ManagerAuth: React.FC<ManagerAuthProps> = ({
  storedPin,
  onSuccess,
  onBack,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Handle number click
  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg('');
      if (newPin.length === 4) {
        checkPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const checkPin = async (inputPin: string) => {
    setIsVerifying(true);
    const valid = await verifyPin(inputPin, storedPin);
    setIsVerifying(false);
    if (valid) {
      onSuccess();
    } else {
      setErrorMsg('PIN 번호가 일치하지 않습니다. 다시 입력해 주세요.');
      setPin('');
    }
  };

  // Support physical keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 4) {
          const newPin = pin + e.key;
          setPin(newPin);
          setErrorMsg('');
          if (newPin.length === 4) {
            checkPin(newPin);
          }
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, storedPin]);

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-6 max-w-4xl mx-auto">
      {/* High Density Main Card Container */}
      <div className="w-full bg-white rounded-3xl border-2 border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col h-full justify-between">
        {/* Top Bar */}
        <div className="bg-[#f8fafc] border-b-2 border-[#e2e8f0] px-8 py-5 flex items-center justify-between shrink-0">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] rounded-xl font-bold text-base transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>처음 화면</span>
          </button>

          <div className="flex items-center space-x-2 px-4 py-2 bg-[#0f172a] text-white rounded-xl font-bold text-base border border-slate-700">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>관리자 보안 인증</span>
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-3xl border-2 border-[#cbd5e1] shadow-md flex flex-col items-center my-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-md mb-3 border border-slate-700">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight mb-1">
            부장님 인증
          </h2>
          <p className="text-base text-slate-500 font-semibold mb-6 text-center">
            4자리 관리자 PIN 번호를 입력하세요. (기본: 1234)
          </p>

          {/* 4-Digit Display Indicator */}
          <div className="flex space-x-3 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                  pin.length > index
                    ? 'bg-[#0f172a] text-white border-[#0f172a] scale-105 shadow-sm'
                    : 'bg-slate-100 text-slate-400 border-slate-300'
                }`}
              >
                {pin.length > index ? '●' : ''}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full mb-4 p-3 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-center space-x-2 text-rose-800 text-sm font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                id={`keypad-${digit}`}
                type="button"
                disabled={isVerifying}
                onClick={() => handleDigitClick(digit)}
                className="h-14 bg-slate-50 hover:bg-blue-50 active:bg-blue-100 text-[#1e293b] rounded-xl text-2xl font-black transition-colors cursor-pointer border border-slate-300 shadow-xs flex items-center justify-center select-none"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              disabled={isVerifying}
              className="h-14 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] rounded-xl text-base font-bold transition-colors cursor-pointer border border-slate-300 flex items-center justify-center"
            >
              전체 지움
            </button>

            {/* 0 Button */}
            <button
              id="keypad-0"
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigitClick('0')}
              className="h-14 bg-slate-50 hover:bg-blue-50 active:bg-blue-100 text-[#1e293b] rounded-xl text-2xl font-black transition-colors cursor-pointer border border-slate-300 shadow-xs flex items-center justify-center select-none"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isVerifying}
              className="h-14 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1e293b] rounded-xl text-base font-bold transition-colors cursor-pointer border border-slate-300 flex items-center justify-center"
              title="한 글자 지우기"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="shrink-0 text-center text-slate-500 font-medium text-sm py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
          키보드의 숫자 키 또는 화면의 숫자 버튼을 터치하여 입력할 수 있습니다.
        </div>
      </div>
    </div>

  );
};
