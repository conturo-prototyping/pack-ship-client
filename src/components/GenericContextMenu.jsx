import React from "react";
import Menu from "@mui/material/Menu";

export default function ContextMenu({ children, contextMenu, setContextMenu }) {
  const handleClose = (event) => {
    setContextMenu(null);
  };

  return (
    <div>
      <Menu
        open={contextMenu !== null}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        componentsProps={{
          root: {
            onContextMenu: (e) => {
              e.preventDefault();
              handleClose();
            },
          },
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
