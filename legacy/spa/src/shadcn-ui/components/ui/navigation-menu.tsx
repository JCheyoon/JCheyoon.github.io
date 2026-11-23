import React from 'react';

export const NavigationMenu: React.FC<any> = ({ children, className, ...props }) => (
  <nav className={className} {...props}>
    {children}
  </nav>
);

export const NavigationMenuList: React.FC<any> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const NavigationMenuItem: React.FC<any> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const NavigationMenuLink: React.FC<any> = ({ children, className, ...props }) => (
  <a className={className} {...props}>
    {children}
  </a>
);

export default NavigationMenu;
