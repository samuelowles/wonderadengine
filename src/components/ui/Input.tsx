import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-micro font-micro text-text-secondary mb-2 ml-[16px]">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-[16px] top-1/2 -translate-y-1/2 text-text-muted transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full h-[56px] 
                            bg-surface-subtle hover:bg-[#EBEBEF] transition-colors
                            px-[16px] ${icon ? 'pl-[48px]' : ''}
                            rounded-input
                            border-none
                            focus:outline-none focus:bg-[#EBEBEF] focus:ring-0
                            font-body text-[16px] text-text-primary placeholder:text-text-muted
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${error ? 'bg-red-50 text-red-900' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 ml-[16px] text-body-xs text-red-600 animate-fade-in">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
