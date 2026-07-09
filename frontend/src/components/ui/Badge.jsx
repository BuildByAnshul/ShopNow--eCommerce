import React from 'react';

const statusMap = {
  pending: 'badge-warning',
  paid: 'badge-success',
  failed: 'badge-error',
  refunded: 'badge-info',
  processing: 'badge-warning',
  confirmed: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-error',
  user: 'badge-primary',
  admin: 'badge bg-botanical-accent/20 text-botanical-accent-dark',
};

const Badge = ({ children, variant, className = '' }) => {
  const cls = statusMap[variant] || statusMap[children?.toLowerCase()] || 'badge-primary';
  return (
    <span className={`${cls} ${className}`}>{children}</span>
  );
};

export default Badge;
