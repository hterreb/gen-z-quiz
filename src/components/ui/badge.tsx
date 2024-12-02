import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'warning' | null | undefined;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-800',
    destructive: 'bg-red-500 text-white',
    outline: 'border border-gray-300 text-gray-800',
    secondary: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white',
  } as const;

  const getVariantClass = (v: BadgeProps['variant']) => {
    if (!v || !(v in variantClasses)) {
      return variantClasses.default;
    }
    return variantClasses[v];
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded ${getVariantClass(variant)}`}>
      {children}
    </span>
  );
};

export default Badge; 