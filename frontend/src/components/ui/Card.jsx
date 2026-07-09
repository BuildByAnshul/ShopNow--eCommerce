import React from 'react';

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`card ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export default Card;
