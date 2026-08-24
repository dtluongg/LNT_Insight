import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-slate-50 cursor-pointer shadow-xs ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-slate-200'
          }`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-danger font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
