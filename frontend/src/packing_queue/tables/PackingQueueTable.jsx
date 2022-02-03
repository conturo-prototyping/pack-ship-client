import React, { useState, useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";
import { createColumnFilters } from "../../utils/TableFilters";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  fulfilledQtyHeader: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  help: {
    paddingLeft: "10px",
  },
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const PackingQueueTable = ({
  tableData,
  onRowClick,
  selectedOrderNumber,
  selectionOrderIds,
}) => {
  const classes = useStyle();

  const [sortModel, setSortModel] = useState([
    { field: "orderNumber", sort: "asc" },
    { field: "part", sort: "asc" },
    { field: "batchQty", sort: "asc" },
    { field: "fulfilledQty", sort: "asc" },
  ]);

  const columns = useMemo(
    () => [
      {
        field: "orderNumber",
        flex: 1,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Order</Typography>;
        },
      },
      {
        field: "part",
        renderCell: (params) => (
          <div>
            <Typography>{params.row.part}</Typography>
            <Typography color="textSecondary">
              {params.row.partDescription}
            </Typography>
          </div>
        ),
        flex: 1,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Part</Typography>;
        },
      },
      {
        field: "batchQty",
        type: "number",
        flex: 1,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Batch Qty</Typography>;
        },
      },
      {
        field: "fulfilledQty",
        type: "number",
        renderHeader: (params) => {
          return (
            <div className={classes.fulfilledQtyHeader}>
              <Typography sx={{ fontWeight: 900 }}>Fulfilled Qty</Typography>
              <HelpTooltip tooltipText="This includes number of items that have been packed as well as number of items that have shipped." />
            </div>
          );
        },
        flex: 1,
      },
    ],
    [classes.fulfilledQtyHeader]
  );

  const queueData = useMemo(() => {
    if (sortModel.length !== 0) {
      // find the filter handler based on the column clicked
      const clickedColumnField = createColumnFilters(columns, tableData).find(
        (e) => e.field === sortModel[0]?.field
      );
      // execute the handler
      return clickedColumnField?.handler(
        sortModel[0]?.sort,
        selectionOrderIds,
        tableData
      );
    } else {
      return tableData;
    }
  }, [sortModel, tableData, selectionOrderIds, columns]);

  return (
    <div className={classes.root}>
      <DataGrid
        sx={{ border: "none", height: "65vh" }}
        className={classes.table}
        disableSelectionOnClick={false}
        isRowSelectable={(params) => {
          // If orders are selected, disable selecting of
          // other orders if the order number does not match
          // that if the selected order
          if (
            selectedOrderNumber !== null &&
            selectedOrderNumber !== params.row.orderNumber
          ) {
            return false;
          }
          return true;
        }}
        onSelectionModelChange={(selectionModel, _) => {
          onRowClick(selectionModel, tableData);
        }}
        selectionModel={selectionOrderIds}
        rows={queueData}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
      />
    </div>
  );
};

export default PackingQueueTable;
