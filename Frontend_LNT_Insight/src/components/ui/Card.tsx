import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-xl shadow-xs p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
