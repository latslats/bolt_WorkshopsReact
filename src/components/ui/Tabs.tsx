import * as React from "react";
import { cn } from "../../utils/cn";

const TabsContext = React.createContext<{
  selectedValue: string;
  onChange: (value: string) => void;
} | null>(null);

const Tabs = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className 
}: { 
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const onChange = React.useCallback((newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);

  return (
    <TabsContext.Provider value={{ selectedValue, onChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex space-x-1 bg-moss-green/10 p-1 rounded-lg", className)}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ 
  value, 
  children, 
  className 
}: { 
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }
  
  const { selectedValue, onChange } = context;
  const isSelected = selectedValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onChange(value)}
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-md transition-all",
        isSelected 
          ? "bg-white shadow text-forest-green" 
          : "text-charcoal/70 hover:text-charcoal/90",
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ 
  value, 
  children, 
  className 
}: { 
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }
  
  const { selectedValue } = context;
  
  if (selectedValue !== value) {
    return null;
  }
  
  return (
    <div
      role="tabpanel"
      className={cn("mt-2", className)}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
