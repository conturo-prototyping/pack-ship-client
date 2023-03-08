import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, TablePagination } from "@mui/material";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PackShipProgress } from "../../common/CircularProgress";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  NAV_BAR_HEIGHT,
  PAGINATION_SIZING_OPTIONS,
} from "../../utils/Constants";
import { onPageSizeChange } from "../../utils/TablePageSizeHandler";
import { useLocalStorage } from "../../utils/localStorage";
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

const PendingTable = ({
  sortModel,
  setSortModel,
  filteredData,
  fetchData,
  isLoading,
  handleContextMenu,
}) => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);

  const [numRowsPerPage, setNumRowsPerPage] = useLocalStorage(
    "pendingPackingQueueNumRows",
    window.innerHeight > 1440 ? 25 : 10
  );
  const [page, setPage] = useState(0);
  const [queueData, setQueueData] = useState(filteredData);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setQueueData(filteredData);
  }, [filteredData]);

  useEffect(() => {
    if (isMounted) fetchData();
  }, [fetchData, isMounted]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const generateTablePagination = useCallback(() => {
    return (
      <table>
        <tbody>
          <tr>
            <TablePagination
              count={queueData.length}
              rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
              rowsPerPage={numRowsPerPage}
              onRowsPerPageChange={(event) => {
                const pageValue = parseInt(event.target.value, 10);
                onPageSizeChange(
                  pageValue,
                  page,
                  queueData.length,
                  setPage,
                  setNumRowsPerPage
                );
              }}
              onPageChange={handlePageChange}
              page={page}
              sx={{ border: "0px" }}
            />
          </tr>
        </tbody>
      </table>
    );
  }, [page, queueData.length, numRowsPerPage, setNumRowsPerPage]);

  return (
    <div className={classes.root}>
      <DataGrid
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - ${NAV_BAR_HEIGHT} - 5rem)`,
          minHeight: "20rem",
        }}
        className={classes.table}
        rows={
          isLoading
            ? []
            : filteredData.slice(
                page * numRowsPerPage,
                page * numRowsPerPage + numRowsPerPage
              )
        }
        columns={columns}
        pageSize={numRowsPerPage}
        rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
        columnBuffer={0}
        disableColumnSelector
        disableDensitySelector
        checkboxSelection={false}
        disableSelectionOnClick={true}
        loading={isLoading}
        sortModel={sortModel}
        onSortModelChange={(model) => {
          setSortModel(model);
        }}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
          Footer: () => generateTablePagination(),
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

export default withPendingTable(PendingTable);
