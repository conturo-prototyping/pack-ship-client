import { Box } from "@mui/material";
import { styled } from "@mui/system";
import { useGridApiRef, DataGridPro } from "@mui/x-data-grid-pro";
import React, { useEffect, useMemo } from "react";

const ThisDataGrid = styled(DataGridPro)`
  .MuiDataGrid-row {
    max-height: fit-content !important;
  }

  .MuiDataGridPro-renderingZone {
    max-height: none !important;
  }

  .MuiDataGrid-cell {
    max-height: fit-content !important;
    overflow: auto;
    height: auto;
    line-height: none !important;
    align-items: center;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
`;

const PackShipDataGrid = ({
  rowData,
  columns,
  sx,
  className,
  disableSelectionOnClick,
  rowHeight,
  pageSize,
  rowsPerPageOptions,
  checkboxSelection,
  editMode,
  sort,
  onEditRowsModelChange,
  hideFooter,
}) => {
  const apiRef = useGridApiRef();
  const packQtyCol = useMemo(() => {
    return columns.filter((e) => e.field === "packQty");
  }, [columns]);

  useEffect(() => {
    if (rowData[0].packQty !== undefined && packQtyCol[0].editable) {
      apiRef.current.setCellFocus(rowData[0].id, "packQty");
      apiRef.current.startRowEditMode({ id: rowData[0].id, field: "packQty" });

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

  const handleCellClick = React.useCallback(
    (params) => {
      if (
        params.field === "packQty" &&
        packQtyCol[0].editable &&
        apiRef.current.getRowMode(params.id) !== "edit"
      ) {
        apiRef.current.startRowEditMode({ id: params.id });
      }
    },
    [apiRef, packQtyCol]
  );

  return (
    <Box
      sx={{
        height: "fit-content",
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
      <ThisDataGrid
        experimentalFeatures={{ newEditingApi: true }}
        rows={rowData}
        columns={columns}
        onEditRowsModelChange={onEditRowsModelChange}
        sx={{
          ...sx,
        }}
        className={className}
        disableSelectionOnClick={disableSelectionOnClick}
        rowHeight={rowHeight}
        pageSize={pageSize}
        rowsPerPageOptions={rowsPerPageOptions}
        checkboxSelection={checkboxSelection}
        editMode={editMode}
        sort={sort}
        hideFooter={hideFooter}
        apiRef={apiRef}
        onCellClick={handleCellClick}
      />
    </Box>
  );
};

export default PackShipDataGrid;
