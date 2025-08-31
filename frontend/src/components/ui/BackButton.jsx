import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from './ProfessionalIcon';

const BackButton = ({ 
  to = null, 
  label = 'Back', 
  className = '', 
  showIcon = true,
  variant = 'default' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const baseClasses = 'inline-flex items-center font-medium transition-colors';
  
  const variants = {
    default: 'text-gray-600 hover:text-gray-900',
    primary: 'text-primary hover:text-primary/80',
    button: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg',
    outline: 'border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg'
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {showIcon && <ArrowLeft className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};

export default BackButton;
