import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-3 py-2 select-none">
      {/* Previous Page */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`flex items-center space-x-2 px-5 py-3 rounded-xl border-2 font-bold text-xl transition-all ${
          currentPage === 1
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            : 'bg-white text-[#1e293b] border-slate-300 hover:bg-slate-50 hover:border-blue-400 active:bg-slate-100 cursor-pointer shadow-xs'
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
        <span>이전</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-14 h-14 rounded-xl border-2 text-2xl font-black transition-all cursor-pointer ${
              currentPage === page
                ? 'bg-[#1d4ed8] text-white border-[#1e3a8a] shadow-md scale-105'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:border-blue-400 active:bg-slate-100'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Page */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`flex items-center space-x-2 px-5 py-3 rounded-xl border-2 font-bold text-xl transition-all ${
          currentPage === totalPages
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            : 'bg-white text-[#1e293b] border-slate-300 hover:bg-slate-50 hover:border-blue-400 active:bg-slate-100 cursor-pointer shadow-xs'
        }`}
      >
        <span>다음</span>
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

