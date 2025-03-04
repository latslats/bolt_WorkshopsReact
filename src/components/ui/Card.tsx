import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ className, children, onClick, hover = true }) => {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden border border-moss-green/10",
        hover && "transition-all duration-200 hover:shadow-lg hover:border-moss-green/30",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div className={cn("p-4 border-b border-moss-green/10", className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h3 className={cn("text-lg font-semibold text-forest-green dark:text-moss-green", className)}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  className?: string;
  children: ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return (
    <div className={cn("p-4 border-t border-moss-green/10 bg-white-linen/50 dark:bg-charcoal/50", className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
