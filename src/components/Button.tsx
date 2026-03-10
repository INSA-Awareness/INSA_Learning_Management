import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'social';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:ring-2 focus:ring-brand-red focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

        const variants = {
            primary: 'bg-brand-red text-white hover:bg-brand-red-hover border border-transparent shadow-sm',
            outline: 'bg-transparent border border-brand-red text-brand-red hover:bg-red-50',
            ghost: 'bg-transparent text-brand-text hover:bg-gray-100 hover:text-foreground',
            social: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
        };

        const sizes = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-11 px-4 py-2 text-sm',
            lg: 'h-14 px-8 text-base'
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
