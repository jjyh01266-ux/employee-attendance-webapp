import React, { useEffect, useState } from 'react';
import { Home, Building2, Clock as ClockIcon } from 'lucide-react';

interface HeaderProps {
  companyName: string;
  currentRoleTitle: string;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ companyName, currentRoleTitle, onGoHome }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="app-header"
      className="h-[80px] bg-[#0f172a] text-white flex items-center justify-between px-6 md:px-8 border-b-4 border-[#1e3a8a] shadow-md shrink-0 select-none z-30"
    >
      {/* Left side: Logo + Title + Home Button */}
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-[#1e3a8a] border border-blue-600 flex items-center justify-center text-blue-400 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl md:text-[26px] font-extrabold tracking-tight text-white">
            {companyName}
          </h1>
        </div>

        <button
          id="btn-nav-home"
          onClick={onGoHome}
          className="ml-2 flex items-center space-x-2 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white border border-blue-800 rounded-xl text-lg md:text-[20px] font-bold transition-colors cursor-pointer shadow-xs focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
          title="첫 화면으로 이동"
        >
          <Home className="w-5 h-5 text-blue-300" />
          <span>처음 화면</span>
        </button>
      </div>

      {/* Right side: Current role & clock */}
      <div className="flex items-center space-x-4">
        {timeStr && (
          <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 bg-slate-800/80 text-slate-300 rounded-lg text-lg font-semibold border border-slate-700">
            <ClockIcon className="w-4 h-4 text-slate-400" />
            <span>{timeStr}</span>
          </div>
        )}
        <div
          id="current-role-badge"
          className="px-5 py-2 bg-[#1e3a8a] border border-blue-700 text-blue-100 rounded-lg text-xl md:text-[22px] font-bold tracking-wide shadow-inner"
        >
          {currentRoleTitle}
        </div>
      </div>
    </header>
  );
};

