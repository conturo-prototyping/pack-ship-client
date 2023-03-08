import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PackShipProgress } from "../../common/CircularProgress";
import { getSortFromModel } from "../utils/sortModelFunctions";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  NAV_BAR_HEIGHT,
  PAGINATION_SIZING_OPTIONS,
} from "../../utils/Constants";
import { onPageSizeChange } from "../../utils/TablePageSizeHandler";
import withPendingTable from "./PackingContextMenuTable";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    minHeight: "20rem",
  },
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const columns = [
  {
    field: "orderId",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Order</Typography>;
    },
    flex: 1,
  },
  {
    field: "label",
    renderHeader: () => {
      return (
        <Typography sx={{ fontWeight: 900 }}>Packing Slip Label</Typography>
      );
    },
    flex: 2,
  },
  {
    field: "destination",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Destination</Typography>;
    },
    flex: 1,
  },
  {
    field: "dateCreated",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Date Created</Typography>;
    },
    flex: 1,
  },
];

const HistoryTable = ({
  sortModel,
  setSortModel,
  fetchData,
  histTotalCount,
  historyLoading,
  filteredData,
  histResultsPerPage,
  orderNumber,
  partNumber,
  pageNumber,
  onPageChange,
  setHistResultsPerPage,
  handleContextMenu,
}) => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reloadData = useCallback(() => {
    if (isMounted) {
      fetchData(getSortFromModel(sortModel), 0, "", "").finally(() => {});
    }
    // eslint-disable-next-line
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) reloadData();
  }, [reloadData, isMounted]);

  return (
    <div className={classes.root}>
      <DataGrid
        paginationMode="server"
        onPageChange={onPageChange}
        rowCount={histTotalCount}
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - ${NAV_BAR_HEIGHT} - 5rem)`,
          minHeight: "20rem",
          ".MuiDataGrid-footerContainer": {
            backgroundColor: "primary.light",
          },
        }}
        className={classes.table}
        disableSelectionOnClick={true}
        rows={historyLoading ? [] : filteredData}
        rowHeight={65}
        page={pageNumber}
        columns={columns}
        pageSize={histResultsPerPage}
        rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
        onPageSizeChange={(newPageSize) => {
          onPageSizeChange(
            newPageSize,
            pageNumber,
            filteredData.length,
            onPageChange,
            setHistResultsPerPage
          );
        }}
        checkboxSelection={false}
        editMode="row"
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={async (model) => {
          setSortModel(model);
          await fetchData(
            getSortFromModel(model),
            pageNumber,
            orderNumber,
            partNumber
          );
        }}
        loading={historyLoading}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
        }}
        componentsProps={{
          row: {
            onContextMenu: handleContextMenu,
          },
        }}
      />
    </div>
  );
};

export default withPendingTable(HistoryTable);
