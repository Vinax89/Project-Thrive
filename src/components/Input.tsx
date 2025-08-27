import React from 'react';

export default function Input({
  label,
  id,
  className = '',
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? React.useId();
  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
    </div>
  );
}
