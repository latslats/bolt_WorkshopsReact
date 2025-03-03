import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: ReactNode;
  children?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  icon,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-forest-green text-white-linen hover:bg-spring-garden dark:bg-spring-garden dark:hover:bg-moss-green",
    outline: "border border-spring-garden bg-transparent hover:bg-spring-garden hover:text-white-linen dark:border-moss-green dark:hover:bg-moss-green dark:hover:text-charcoal",
    ghost: "bg-transparent hover:bg-moss-green hover:text-charcoal dark:hover:bg-spring-garden dark:hover:text-white-linen",
    link: "bg-transparent underline-offset-4 hover:underline text-spring-garden hover:text-forest-green dark:text-moss-green dark:hover:text-lemon-yellow p-0",
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-sm",
    lg: "h-11 px-8 rounded-md text-base",
    icon: "h-10 w-10",
  };
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
