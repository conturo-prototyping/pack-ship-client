import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, IconButton } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PackShipDataGrid from "./PackShipDataGrid";
import { ADD_ROW_ID } from "../utils/Constants";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const PackShipEditableTable = ({
  sx,
  columns,
  tableData,
  onDelete,
  onAdd,
  viewOnly,
  onEditRowsModelChange,
  pageSize = 10,
}) => {
  const classes = useStyle();

  const newColumns = React.useMemo(() => {
    let newColumns = columns;

    // Add the delete action column if not view only
    if (!viewOnly) {
      const deleteCol = [
        {
          field: "actions",
          flex: 1,
          renderCell: (params) => {
            return params.id.includes(ADD_ROW_ID) ? (
              <IconButton onClick={() => onAdd(params.row.pageNum)}>
                <AddCircleOutlineIcon />
              </IconButton>
            ) : (
              <IconButton onClick={() => onDelete(params)}>
                <DeleteIcon />
              </IconButton>
            );
          },
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>Actions</Typography>;
          },
          sortable: false,
        },
      ];
      newColumns = deleteCol.concat(columns);
    }
    return newColumns;
  }, [columns, onAdd, onDelete, viewOnly]);

  const newRows = React.useMemo(() => {
    // Add row for the ability to add a new row when not in viewOnly
    return viewOnly
      ? tableData
      : [
          ...tableData,
          {
            id: ADD_ROW_ID,
          },
        ];
  }, [tableData, viewOnly]);

  const localPageSize = useMemo(() => {
    return viewOnly ? pageSize : newRows.length;
  }, [newRows.length, viewOnly, pageSize]);

  return (
    <div className={classes.root}>
      <PackShipDataGrid
        rowData={newRows}
        sx={{ border: "none", height: "50vh", ...sx }}
        className={classes.table}
        disableSelectionOnClick={true}
        rows={newRows}
        rowHeight={65}
        columns={newColumns}
        pageSize={localPageSize}
        rowsPerPageOptions={[localPageSize]}
        checkboxSelection={false}
        onEditRowsModelChange={onEditRowsModelChange}
        sort={{
          field: "actions",
          sort: "asc",
        }}
        editMode={"row"}
        hideFooter
      />
    </div>
  );
};

export default PackShipEditableTable;
