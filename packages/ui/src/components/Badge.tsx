import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: 'var(--color-surface-2, #1a1a24)',
    color: 'var(--color-text-muted, #8888a0)',
    border: '1px solid var(--color-border, #2a2a38)',
  },
  success: {
    background: 'rgba(34,197,94,0.1)',
    color: 'var(--color-success, #22c55e)',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  warning: {
    background: 'rgba(245,197,66,0.1)',
    color: 'var(--color-gold, #f5c542)',
    border: '1px solid rgba(245,197,66,0.25)',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: 'var(--color-error, #ef4444)',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  info: {
    background: 'rgba(108,99,255,0.12)',
    color: 'var(--color-accent, #6c63ff)',
    border: '1px solid rgba(108,99,255,0.3)',
  },
};

export function Badge({ children, variant = 'default', dot = false }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: 500,
        ...styles[variant],
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
