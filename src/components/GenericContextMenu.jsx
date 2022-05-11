import React from "react";
import Menu from "@mui/material/Menu";

export default function ContextMenu({
  children,
  menuPosition,
  setMenuPosition,
}) {
  const open = Boolean(menuPosition);

  const handleClose = (event) => {
    setMenuPosition(null);
  };

  return (
      <div>
        <Menu
          open={open}
          anchorReference="anchorPosition"
          anchorPosition={menuPosition}
          anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
          }}
          onClose={handleClose}
          role={undefined}
          placement="bottom-start"
          disablePortal
        >
          {children}
        </Menu>
      </div>
  );
}
