import React from 'react';

export default function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'danger' }) {
  const base = "px-4 py-2 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px]";
  const variantClass = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    : variant === 'danger'
    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
  return <button type={type} className={`${base} ${variantClass} ${className}`} {...props}>{children}</button>;
}
