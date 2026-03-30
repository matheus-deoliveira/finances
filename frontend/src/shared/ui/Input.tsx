import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full relative">
        {label && (
          <label className="text-sm font-semibold text-[#0F0F0F] ml-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:border-black disabled:cursor-not-allowed disabled:opacity-50',
            type === 'date' && 'appearance-none [color-scheme:light] relative block w-full',
            error && 'border-red-500 focus-visible:ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {type === 'date' && (
          <div className="absolute right-4 top-[38px] pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </div>
        )}
        {error && (
          <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
