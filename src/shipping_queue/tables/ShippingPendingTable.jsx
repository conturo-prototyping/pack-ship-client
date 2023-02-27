import React, { useCallback, useState, useEffect, useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, TablePagination, Grid } from "@mui/material";
import { createColumnFilters } from "../../utils/TableFilters";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  NAV_BAR_HEIGHT,
  PAGINATION_SIZING_OPTIONS,
} from "../../utils/Constants";
import { getCheckboxColumn } from "../../components/CheckboxColumn";
import { PackShipProgress } from "../../common/CircularProgress";
import { useLocalStorage } from "../../utils/localStorage";
import { onPageSizeChange } from "../../utils/TablePageSizeHandler";
import withContextMenu from "./ContextMenuTable";
import withStyledTable from "./StyledTable";

const useStyle = makeStyles((theme) => ({
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const ShippingPendingTable = ({
  pendingShipments,
  tableData,
  setSortModel,
  sortModel,
  selectedPendingOrder,
  setSelectedOrderIds,
  setFilteredPendingShipments,
  searchText,
  isLoading,
  handleContextMenu,
  StyledDataGrid,
}) => {
  const classes = useStyle();
  const [pendingData, setPendingData] = useState(tableData);

  const [numRowsPerPage, setNumRowsPerPage] = useLocalStorage(
    "shippingQueueNumRows",
    window.innerHeight > 1440 ? 25 : 10
  );

  const [page, setPage] = useState(0);

  useEffect(() => {
    if (searchText) {
      const filtered = pendingShipments.filter(
        (e) =>
          e?.orderNumber?.toLowerCase().includes(searchText?.toLowerCase()) ||
          e?.items?.filter((e) =>
            e.item?.Items?.PartNumber?.toLowerCase().includes(
              searchText?.toLowerCase()
            )
          ).length > 0 ||
          selectedPendingOrder.includes(e?.id) // Ensure selected rows are included
      );
      setFilteredPendingShipments(sortDataByModel(sortModel, filtered));
    } else {
      setFilteredPendingShipments(sortDataByModel(sortModel, pendingShipments));
    }
    // eslint-disable-next-line
  }, [searchText, setFilteredPendingShipments]);

  const handleSelection = useCallback(
    (selection, tableData) => {
      let newSelection = selectedPendingOrder;
      if (selectedPendingOrder.includes(selection)) {
        // remove it
        newSelection = selectedPendingOrder.filter((e) => e !== selection);
      } else {
        // add it
        newSelection[0] = selection;
      }
      return newSelection;
    },
    [selectedPendingOrder]
  );

  const onQueueRowClick = useCallback(
    (selectionModel, tableData) => {
      const newSelectedShipmentIds = handleSelection(selectionModel, tableData);

      setSelectedOrderIds([...newSelectedShipmentIds]);
    },
    [handleSelection, setSelectedOrderIds]
  );

  const columns = useMemo(
    () => [
      getCheckboxColumn(
        () => false, // No params to disable on for now.
        selectedPendingOrder,
        false,
        tableData,
        () => {},
        onQueueRowClick,
        false,
        searchText,
        false
      ),
      {
        field: "label",
        flex: 1,
        sortingOrder: ["desc", "asc"],
        renderHeader: (params) => {
          return (
            <Typography sx={{ fontWeight: 900 }}>Shipment Label</Typography>
          );
        },
      },
      {
        field: "trackingNumber",
        flex: 1,
        sortable: false,
        renderHeader: (params) => {
          return (
            <Typography sx={{ fontWeight: 900 }}>Tracking / Handoff</Typography>
          );
        },
        renderCell: (params) => (
          <div>
            <Typography>
              {params.row.customerHandoffName || params.row.trackingNumber}
            </Typography>
          </div>
        ),
      },
      {
        field: "destination",
        flex: 1,
        sortable: false,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Destination</Typography>;
        },
      },
      {
        field: "dateCreated",
        flex: 1,
        sortingOrder: ["desc", "asc"],
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Date Created</Typography>;
        },
      },
    ],
    [selectedPendingOrder, onQueueRowClick, tableData, searchText]
  );

  const sortDataByModel = useCallback(
    (model, data) => {
      if (model.length !== 0) {
        // find the filter handler based on the column clicked
        const clickedColumnField = createColumnFilters(columns, data).find(
          (e) => e.field === model[0]?.field
        );
        // execute the handler
        return clickedColumnField?.handler(
          model[0]?.sort,
          selectedPendingOrder,
          data
        );
      } else {
        return data;
      }
    },
    [columns, selectedPendingOrder]
  );

  useEffect(() => {
    setPendingData(tableData);
  }, [tableData, setPendingData]);

  const generateTablePagination = useCallback(() => {
    return (
      <table>
        <tbody>
          <tr>
            <TablePagination
              count={pendingData?.length}
              rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
              rowsPerPage={numRowsPerPage}
              onPageChange={(_event, newPage) => {
                setPage(newPage);
              }}
              onRowsPerPageChange={(event) => {
                const pageValue = parseInt(event.target.value, 10);
                onPageSizeChange(
                  pageValue,
                  page,
                  pendingData.length,
                  setPage,
                  setNumRowsPerPage
                );
              }}
              page={page}
              sx={{ border: "0px" }}
            />
          </tr>
        </tbody>
      </table>
    );
  }, [page, pendingData?.length, numRowsPerPage, setNumRowsPerPage]);

  return (
    <StyledDataGrid
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
      rows={
        isLoading
          ? []
          : pendingData.slice(
              page * numRowsPerPage,
              page * numRowsPerPage + numRowsPerPage
            )
      }
      rowHeight={65}
      columns={columns}
      pageSize={numRowsPerPage}
      rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
      checkboxSelection={false}
      editMode="row"
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={async (model) => {
        setSortModel(model);
        setPendingData(sortDataByModel(model, tableData));
      }}
      loading={isLoading}
      components={{
        LoadingOverlay: () => <PackShipProgress />,
        Footer: () =>
          selectedPendingOrder.length > 0 ? (
            <Grid
              container
              item
              alignItems="center"
              sx={{
                backgroundColor: "primary.light",
                borderTop: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              <Grid container item xs={6} justifyContent="flex-start">
                <Typography sx={{ padding: "8px" }}>
                  {selectedPendingOrder.length} rows selected
                </Typography>
              </Grid>
              <Grid container item xs={6} justifyContent="flex-end">
                {generateTablePagination()}
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              item
              xs={12}
              justifyContent="flex-end"
              sx={{
                backgroundColor: "primary.light",
                borderTop: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              {generateTablePagination()}
            </Grid>
          ),
      }}
      componentsProps={{
        row: {
          onContextMenu: handleContextMenu,
        },
      }}
    />
  );
};

export default withContextMenu(withStyledTable(ShippingPendingTable));