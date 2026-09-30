import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  className?: string;
  maxHeight?: string; // Chiều cao tối đa để cuộn nội dung (mặc định: max-h-[480px])
  renderFooter?: () => React.ReactNode; // Hàng tổng ở cuối
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  className = '',
  maxHeight = 'max-h-[450px]',
  renderFooter,
}: TableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 ${maxHeight} ${className}`}
    >
      <table className="w-full text-left border-collapse relative">
        {/* Sticky Header: Cố định trên cùng khi cuộn */}
        <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-xs">
          <tr className="text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 py-3.5 bg-slate-100 dark:bg-slate-950 ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body dữ liệu: Cuộn ở giữa */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900">
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row, rowIndex)}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
            >
              {columns.map((column, colIndex) => {
                const cellContent =
                  typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : (row[column.accessor] as React.ReactNode);
                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 font-medium ${column.className || ''}`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium"
              >
                Không có dữ liệu.
              </td>
            </tr>
          )}
        </tbody>

        {/* Sticky Footer: Hàng Tổng cố định ở đáy bảng */}
        {renderFooter && (
          <tfoot className="sticky bottom-0 z-10 border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 shadow-xs font-bold text-sm">
            {renderFooter()}
          </tfoot>
        )}
      </table>
    </div>
  );
}