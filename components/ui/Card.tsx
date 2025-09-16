
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-2xl shadow-2xl p-8 glass-card ${className}`}>
      {children}
    </div>
  );
};

export default Card;
