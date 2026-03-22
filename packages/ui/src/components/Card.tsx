import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
  hoverable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({
  children,
  title,
  subtitle,
  footer,
  noPadding = false,
  hoverable = false,
  style,
  className,
}: CardProps) {
  const cardStyle: React.CSSProperties = {
    background: 'var(--color-surface, #111118)',
    border: '1px solid var(--color-border, #2a2a38)',
    borderRadius: 'var(--radius, 12px)',
    overflow: 'hidden',
    transition: hoverable ? 'border-color 0.15s, box-shadow 0.15s' : undefined,
    ...style,
  };

  const bodyStyle: React.CSSProperties = {
    padding: noPadding ? 0 : '24px',
  };

  return (
    <div
      style={cardStyle}
      className={className}
      onMouseEnter={
        hoverable
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                'var(--color-accent, #6c63ff)';
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 0 1px var(--color-accent, #6c63ff)';
            }
          : undefined
      }
      onMouseLeave={
        hoverable
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                'var(--color-border, #2a2a38)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }
          : undefined
      }
    >
      {(title || subtitle) && (
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border, #2a2a38)',
          }}
        >
          {title && (
            <h3
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-text, #e8e8f0)',
                margin: 0,
                marginBottom: subtitle ? '4px' : 0,
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-muted, #8888a0)',
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div style={bodyStyle}>{children}</div>

      {footer && (
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--color-border, #2a2a38)',
            background: 'var(--color-surface-2, #1a1a24)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
