import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-body, sans-serif)',
  fontWeight: 600,
  borderRadius: '8px',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'background 0.15s, opacity 0.15s, border-color 0.15s',
  gap: '8px',
  whiteSpace: 'nowrap',
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent, #6c63ff)',
    color: '#fff',
    borderColor: 'transparent',
  },
  secondary: {
    background: 'var(--color-surface-2, #1a1a24)',
    color: 'var(--color-text, #e8e8f0)',
    borderColor: 'var(--color-border, #2a2a38)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted, #8888a0)',
    borderColor: 'transparent',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    color: 'var(--color-error, #ef4444)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '12px', height: '30px' },
  md: { padding: '9px 18px', fontSize: '14px', height: '38px' },
  lg: { padding: '12px 24px', fontSize: '15px', height: '46px' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const combinedStyle: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(fullWidth ? { width: '100%' } : {}),
    ...(isDisabled ? { opacity: 0.55, cursor: 'not-allowed' } : {}),
    ...style,
  };

  return (
    <button style={combinedStyle} disabled={isDisabled} {...rest}>
      {loading ? (
        <SpinnerInline />
      ) : (
        <>
          {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

function SpinnerInline() {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'ybSpin 0.65s linear infinite',
      }}
    />
  );
}
