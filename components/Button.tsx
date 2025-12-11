import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cad-accent text-cad-dark hover:bg-sky-400 border border-transparent shadow-lg shadow-sky-500/20",
    secondary: "bg-transparent text-slate-300 border border-cad-border hover:border-cad-accent hover:text-cad-accent",
    ghost: "bg-cad-input text-slate-200 hover:bg-cad-accent hover:text-cad-dark border border-transparent"
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    icon: "w-9 h-9 p-0"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
