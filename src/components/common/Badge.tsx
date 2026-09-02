import React from 'react';
import { ApplicationStatus } from '../../types';
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

interface BadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';
  let icon = null;

  switch (status) {
    case '승인대기':
      bgClass = 'bg-[#fff7ed]';
      textClass = 'text-[#ea580c]';
      borderClass = 'border-2 border-[#ffedd5] shadow-xs';
      icon = <Clock className={size === 'lg' ? 'w-6 h-6 mr-2' : 'w-4 h-4 mr-1.5'} />;
      break;
    case '승인':
      bgClass = 'bg-[#f0fdf4]';
      textClass = 'text-[#16a34a]';
      borderClass = 'border-2 border-[#dcfce7] shadow-xs';
      icon = <CheckCircle2 className={size === 'lg' ? 'w-6 h-6 mr-2' : 'w-4 h-4 mr-1.5'} />;
      break;
    case '반려':
      bgClass = 'bg-[#fef2f2]';
      textClass = 'text-[#dc2626]';
      borderClass = 'border-2 border-[#fee2e2] shadow-xs';
      icon = <XCircle className={size === 'lg' ? 'w-6 h-6 mr-2' : 'w-4 h-4 mr-1.5'} />;
      break;
    case '취소':
      bgClass = 'bg-[#f1f5f9]';
      textClass = 'text-[#475569]';
      borderClass = 'border-2 border-[#cbd5e1] shadow-xs';
      icon = <Ban className={size === 'lg' ? 'w-6 h-6 mr-2' : 'w-4 h-4 mr-1.5'} />;
      break;
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-base font-bold',
    md: 'px-3.5 py-1.5 text-lg font-black',
    lg: 'px-6 py-3 text-2xl font-black rounded-xl',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-black rounded-lg tracking-wide whitespace-nowrap ${bgClass} ${textClass} ${borderClass} ${sizeClasses[size]}`}
    >
      {showIcon && icon}
      {status}
    </span>
  );
};

