import React, { useState } from "react";
import { CustomHomePage } from "./CustomHomePage";

const List: React.FC<{ items: any[] }> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="Search ..."
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "20px", padding: "10px", width: "100%" }}
      />
      <CustomHomePage.TileGrid3>
        {items
          .filter(
            (item) =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((item) => (
            <CustomHomePage.Tile
              key={item.href}
              href={item.href}
              title={item.title}
              description={item.description}
              icon={item.icon}
              author={item.author}
            />
          ))}
      </CustomHomePage.TileGrid3>
    </div>
  );
};

export default List;
