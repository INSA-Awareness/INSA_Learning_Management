import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, id, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

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
                        className={`
              block w-full rounded-md border 
              ${error ? 'border-primary focus:border-primary focus:ring-primary' : 'border-gray-300 focus:border-primary focus:ring-primary'}
              ${icon ? 'pl-10' : 'pl-3'}
              py-2.5 text-sm shadow-sm
              bg-white text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-1
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-sm text-primary">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
