import React, { useCallback, useState, useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";
import { getSortFromModel } from "../utils/sortModelFunctions";
import { PackShipProgress } from "../../common/CircularProgress";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  NAV_BAR_HEIGHT,
  PAGINATION_SIZING_OPTIONS,
} from "../../utils/Constants";
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

const ShippingHistoryTable = ({
  sortModel,
  setSortModel,
  fetchSearch,
  filteredShippingHist,
  histResultsPerPage,
  histTotalCount,
  orderNumber,
  partNumber,
  historyLoading,
  setHistResultsPerPage,
  handleContextMenu,
  page,
  setPage,
  StyledDataGrid,
}) => {
  const classes = useStyle();

  const [isLoading, setIsLoading] = useState(false);

  const onPageChange = useCallback(
    async (pageNumber) => {
      setPage(pageNumber);
      setIsLoading(true);
      await fetchSearch(
        getSortFromModel(sortModel),
        pageNumber + 1,
        orderNumber,
        partNumber
      );
      setIsLoading(false);
    },
    [setPage, fetchSearch, sortModel, orderNumber, partNumber]
  );

  const columns = useMemo(
    () => [
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
          return <Typography sx={{ fontWeight: 900 }}>Tracking #</Typography>;
        },
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
    []
  );

  return (
    <StyledDataGrid
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
      rows={isLoading || historyLoading ? [] : filteredShippingHist}
      rowHeight={65}
      columns={columns}
      pageSize={histResultsPerPage}
      rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
      onPageSizeChange={(newPageSize) => {
        onPageSizeChange(
          newPageSize,
          page,
          filteredShippingHist.length,
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
        await fetchSearch(
          getSortFromModel(model),
          page + 1,
          orderNumber,
          partNumber
        );
      }}
      loading={isLoading || historyLoading}
      components={{
        LoadingOverlay: () => <PackShipProgress />,
      }}
      componentsProps={{
        row: {
          onContextMenu: handleContextMenu,
        },
      }}
    />
  );
};

const cantEditShippingDetails = {
  deliverySpeed: false,
  trackingNumber: false,
  cost: false,
  customerHandoffName: false,
  customerAccount: false,
};

export default withContextMenu(
  withStyledTable(ShippingHistoryTable),
  cantEditShippingDetails
);
