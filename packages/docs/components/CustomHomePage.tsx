import React from 'react'

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="custom-homepage">{children}</div>
);

const Headline: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <h1 className="custom-homepage-headline">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === 'p') {
          return React.cloneElement(child, {
            className: `custom-homepage-headline-text ${child.props.className || ''}`.trim()
          });
        }
        return <span className="custom-homepage-headline-text">{child}</span>;
      })}
    </h1>
  );
};

const Subhead: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="custom-homepage-subhead">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === 'p') {
          return React.cloneElement(child, {
            className: `custom-homepage-subhead-text ${child.props.className || ''}`.trim()
          });
        }
        return <span className="custom-homepage-subhead-text">{child}</span>;
      })}
    </div>
  );
};

const TileGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="custom-homepage-grid">{children}</div>
);

interface TileProps {
    href: string;
    title: string;
    description: string;
    icon?: string;
    isExternal?: boolean;
  }
  
  const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="custom-homepage-tile-external-icon">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
  
  const Tile: React.FC<TileProps> = ({ href, title, description, icon, isExternal }) => (
    <a 
      href={href} 
      className={`custom-homepage-tile ${isExternal ? 'custom-homepage-tile-external' : ''}`}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {icon && <span className="custom-homepage-tile-icon">{icon}</span>}
      <h2 className="custom-homepage-tile-title">{title}</h2>
      <p className="custom-homepage-tile-description">{description}</p>
      {isExternal && <img src="/.vocs/icons/arrow-diagonal.svg" alt="" className="custom-homepage-tile-external-icon" />}
    </a>
  );
  
export const CustomHomePage = {
  Root,
  Headline,
  Subhead,
  TileGrid,
  Tile,
};