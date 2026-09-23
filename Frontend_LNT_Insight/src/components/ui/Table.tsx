import React from 'react';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  className?: string;
}

export function Table<T>({ columns, data, keyExtractor, className = '' }: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-100 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            {columns.map((column, index) => (
              <th key={index} className={`px-4 py-3.5 ${column.className || ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
          {data.map((row, rowIndex) => (
            <tr key={keyExtractor(row, rowIndex)} className="hover:bg-slate-50 transition-colors">
              {columns.map((column, colIndex) => {
                const cellContent =
                  typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : (row[column.accessor] as React.ReactNode);
                return (
                  <td key={colIndex} className={`px-4 py-3 font-medium ${column.className || ''}`}>
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                Không có dữ liệu.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
