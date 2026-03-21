'use client';

import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, id, type, showPasswordToggle, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        const isPassword = type === 'password';
        const inputType = isPassword && showPasswordToggle && showPassword ? 'text' : type;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                        {props.required && <span className="text-primary ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        type={inputType}
                        className={`
              block w-full rounded-md border 
              ${error ? 'border-primary focus:border-primary focus:ring-primary' : 'border-gray-300 focus:border-primary focus:ring-primary'}
              ${icon ? 'pl-10' : 'pl-3'}
              ${isPassword && showPasswordToggle ? 'pr-10' : 'pr-3'}
              py-2.5 text-sm shadow-sm
              bg-white text-gray-900 placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-primary/20
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              border-gray-300
              ${className}
            `}
                        {...props}
                    />
                    {isPassword && showPasswordToggle && (
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-primary">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
