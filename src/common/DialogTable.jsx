import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useGridApiRef, DataGridPro } from "@mui/x-data-grid-pro";

const DialogTable = ({
  rowData,
  columns,
  cellEditName,
  onEditRowsModelChange,
  viewOnly = false,
  rowId = "id",
}) => {
  const apiRef = useGridApiRef();

  const handleCellClick = React.useCallback(
    (params) => {
      if (params.field === cellEditName && !viewOnly) {
        apiRef.current.setCellMode(params.id, params.field, "edit");
      }
    },
    [apiRef, viewOnly, cellEditName]
  );

  useEffect(() => {
    if (!viewOnly) {
      apiRef.current.setCellFocus(rowData[0][rowId], cellEditName);
      apiRef.current.setCellMode(rowData[0][rowId], cellEditName, "edit");

      return apiRef.current.subscribeEvent(
        "cellModeChange",
        (event) => {
          event.defaultMuiPrevented = true;
        },
        { isFirst: true }
      );
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Box
      sx={{
        height: "55vh",
        width: 1,
        "& .MuiDataGridPro-cell--editing": {
          bgcolor: "rgb(255,215,115, 0.19)",
          color: "#1a3e72",
        },
        "& .Mui-error": {
          bgcolor: (theme) =>
            `rgb(126,10,15, ${theme.palette.mode === "dark" ? 0 : 0.1})`,
          color: (theme) =>
            theme.palette.mode === "dark" ? "#ff4343" : "#750f0f",
        },
      }}>
      <DataGridPro
        sx={{
          border: "none",
          height: "50vh",
          "& .MuiDataGridPro-cell--editable": {
            border: "solid 1px grey",
            fontStyle: "italic",
            ":hover": {
              border: "solid 1px black",
            },
          },
        }}
        rows={rowData}
        columns={columns}
        disableSelectionOnClick
        pageSize={rowData?.length}
        rowsPerPageOptions={[rowData?.length]}
        hideFooter
        onEditRowsModelChange={onEditRowsModelChange}
        editMode={"row"}
        apiRef={apiRef}
        onCellClick={handleCellClick}
        getRowId={(row) => row[rowId]}
      />
    </Box>
  );
};

export default DialogTable;
