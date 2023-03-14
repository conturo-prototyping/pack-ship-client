import React from "react";
import ContextMenu from "../components/GenericContextMenu";
import { MenuItem } from "@mui/material";

const ShippingContextMenu = ({
  setIsEditShipmentOpen,
  setIsEditShipmentViewOnly,
  createShipmentPdfDoc,
  contextMenu,
  setContextMenu,
  setConfirmShippingDeleteDialogOpen,
}) => {
  const historyRowMenuOptions = [
    <MenuItem
      key="view-menu-item"
      onClick={() => {
        setIsEditShipmentOpen(true);
        setIsEditShipmentViewOnly(true);
      }}
    >
      View
    </MenuItem>,
    <MenuItem
      key={"Download"}
      onClick={async () => {
        await createShipmentPdfDoc();
        setContextMenu(null);
      }}
    >
      Download
    </MenuItem>,
    <MenuItem
      key="edit-menu-item"
      onClick={() => {
        setIsEditShipmentOpen(true);
        setIsEditShipmentViewOnly(false);
      }}
    >
      Edit
    </MenuItem>,
    <MenuItem
      key="delete-menu-item"
      onClick={() => {
        setContextMenu(null);
        setConfirmShippingDeleteDialogOpen(true);
      }}
    >
      Delete
    </MenuItem>,
  ];
  return (
    <ContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu}>
      {historyRowMenuOptions}
    </ContextMenu>
  );
};

export default ShippingContextMenu;
