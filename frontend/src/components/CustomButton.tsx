import React from 'react';
import { styles } from '../styles/CustomButtonStyles';

interface CustomButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  text, 
  onClick, 
  className = '', 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default CustomButton;