import React from 'react';

export default function Select({
  label,
  id,
  className = '',
  children,
  ...props
}: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const uniqueId = React.useId();
  const selectId = id ?? uniqueId;
  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
