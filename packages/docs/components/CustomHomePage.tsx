import React from "react";

interface CustomParagraphProps extends React.HTMLProps<HTMLParagraphElement> {
  className?: string;
}

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="custom-homepage">{children}</div>
);

const Headline: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <h1 className="custom-homepage-headline">
      {React.Children.map(children, (child) => {
        if (
          React.isValidElement<CustomParagraphProps>(child) &&
          child.type === "p"
        ) {
          return React.cloneElement(child, {
            className:
              `custom-homepage-headline-text ${child.props.className || ""}`.trim(),
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
      {React.Children.map(children, (child) => {
        if (
          React.isValidElement<CustomParagraphProps>(child) &&
          child.type === "p"
        ) {
          return React.cloneElement(child, {
            className:
              `custom-homepage-subhead-text ${child.props.className || ""}`.trim(),
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

const TileGrid3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="custom-homepage-grid-3">{children}</div>
);

interface TileProps {
  href: string;
  title: string;
  description: string;
  icon?: string;
  isExternal?: boolean;
  author?: string;
  onClick?: () => void;
}

const Tile: React.FC<TileProps> = ({
  href,
  title,
  description,
  icon,
  isExternal,
  author,
  onClick,
}) => (
  <a
    href={href}
    className={`custom-homepage-tile ${isExternal ? "custom-homepage-tile-external" : ""}`}
    target={isExternal ? "_blank" : undefined}
    rel={isExternal ? "noopener noreferrer" : undefined}
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
    }}
    onClick={onClick}>
    {icon && <span className="custom-homepage-tile-icon">{icon}</span>}
    <h2 className="custom-homepage-tile-title">{title}</h2>
    <p className="custom-homepage-tile-description">{description}</p>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
      }}>
      {isExternal && (
        <img
          src="/.vocs/icons/arrow-diagonal.svg"
          alt=""
          className="custom-homepage-tile-external-icon"
        />
      )}
      {author && (
        <div
          style={{
            fontSize: "10px",
            color: "white",
            display: "inline-flex",
            marginTop: "5px",
            alignItems: "center",
            gap: "4px",
          }}>
          by{" "}
          <img
            src="/github.svg"
            alt="GitHub"
            style={{ width: "10px", height: "10px" }}
          />
          <a
            href={`https://github.com/${author}`}
            target="_blank"
            rel="noopener noreferrer preload"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "inherit",
              textDecoration: "none",
              display: "inline-block",
            }}>
            {author}
          </a>
        </div>
      )}
    </div>
  </a>
);

export const CustomHomePage = {
  Root,
  Headline,
  Subhead,
  TileGrid,
  TileGrid3,
  Tile,
};
