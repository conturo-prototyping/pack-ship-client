import React from "react";
import ContextMenu from "../../components/GenericContextMenu";
import { MenuItem } from "@mui/material";

const PackingContextMenu = ({
  openViewPackingSlip,
  onDownloadPDFClick,
  openEditPackingSlip,
  openDeleteDialog,
  contextMenu,
  setContextMenu,
}) => {
  const historyRowMenuOptions = [
    <MenuItem key={"View"} onClick={openViewPackingSlip}>
      View
    </MenuItem>,
    <MenuItem key={"Download"} onClick={onDownloadPDFClick}>
      Download
    </MenuItem>,
    <MenuItem key={"Edit"} onClick={openEditPackingSlip}>
      Edit
    </MenuItem>,
    <MenuItem key={"Delete"} onClick={openDeleteDialog}>
      Delete
    </MenuItem>,
  ];
  return (
    <ContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu}>
      {historyRowMenuOptions}
    </ContextMenu>
  );
};

export default PackingContextMenu;
