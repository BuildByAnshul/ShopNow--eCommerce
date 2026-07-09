import React, { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, id, error, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={`input-field ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
