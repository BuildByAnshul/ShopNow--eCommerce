import React from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
};

const sizes = {
  sm: 'px-5 py-2 text-xs',
  md: '',
  lg: 'px-10 py-4 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${size !== 'md' ? sizes[size] : ''}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
