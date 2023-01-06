import React, { useState, useEffect, useMemo, useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, TablePagination, Grid } from "@mui/material";
import { createColumnFilters } from "../../utils/TableFilters";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  NAV_BAR_HEIGHT,
} from "../../utils/Constants";
import { API } from "../../services/server";
import ReceivingQueueDropdown from "../ReceivingQueueDropdown";
import { styled } from "@mui/system";
import { getCheckboxColumn } from "../../components/CheckboxColumn";
import { PackShipProgress } from "../../common/CircularProgress";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
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
  fulfilledQtyHeader: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
}));

const ReceivingQueueDataGrid = styled(DataGrid)`
  .MuiDataGrid-row {
    max-height: fit-content !important;
  }

  .MuiDataGrid-renderingZone {
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

const ReceivingQueueTable = ({
  receivingQueue,
  tableData,
  sortModel,
  setSortModel,
  selectedShipmentIds,
  setSelectedShipmentIds,
  setReceivingQueue,
  setFilteredReceivingQueue,
  searchText,
}) => {
  const classes = useStyle();
  const [queueData, setQueueData] = useState(tableData);
  //TODO: Use later for selections
  // eslint-disable-next-line
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  //TODO: Use later for selections
  // eslint-disable-next-line
  const [isSelectAllOn, setIsSelectAll] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  //TODO: Set later for when data is coming in.
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false);

  const numRowsPerPage = 10;

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await Promise.all([API.getReceivingQueue()]);
      return { queue: data[0] };
    }

    if (isMounted) {
      setIsLoading(true);
      fetchData()
        .then((data) => {
          if (isMounted) {
            // Gather the queue data for the table
            let queueTableData = [];

            data?.queue.consumablePOQueue.forEach((e) => {
              queueTableData.push({
                id: e._id,
                manifest: e.po,
                source: e.source,
                label: e.label,
                poType: e.sourcePoType,
              });
            });

            data?.queue.workOrderPOQueue.forEach((e) => {
              queueTableData.push({
                id: e._id,
                manifest: e.po,
                source: e.po[0].lines[0]?.packingSlip.destination,
                label: e.label,
                poType: e.sourcePoType,
              });
            });

            // The set state order is important
            queueTableData = sortDataByModel(sortModel, queueTableData);
            setReceivingQueue(queueTableData);
            setFilteredReceivingQueue(queueTableData);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line
  }, [
    setFilteredReceivingQueue,
    setSelectedShipmentIds,
    setReceivingQueue,
    isMounted,
  ]);

  const handleSelection = useCallback(
    (selection, tableData) => {
      let newSelection = selectedShipmentIds;
      if (selectedShipmentIds.includes(selection)) {
        // remove it
        newSelection = selectedShipmentIds.filter((e) => e !== selection);
        // if something is deselected then selectAll is false
        setIsSelectAll(false);
      } else {
        // add it
        newSelection[0] = selection;

        setSelectedShipmentIds(newSelection);
        setIsSelectAll(newSelection.length >= 1);
      }
      return newSelection;
    },
    [selectedShipmentIds, setSelectedShipmentIds]
  );

  const onQueueRowClick = useCallback(
    (selectionModel, tableData) => {
      const newSelectedShipmentIds = handleSelection(selectionModel, tableData);

      setSelectedShipmentIds([...newSelectedShipmentIds]);
    },
    [handleSelection, setSelectedShipmentIds]
  );

  const onSelectAllClick = useCallback(
    (value, tableData) => {
      setIsSelectAll(value);
    },
    [setIsSelectAll]
  );

  const columns = useMemo(
    () => [
      getCheckboxColumn(
        () => false, // No params to disable on for now.
        selectedShipmentIds,
        isSelectAllOn,
        tableData,
        onSelectAllClick,
        onQueueRowClick,
        false,
        searchText,
        false
      ),
      {
        field: "label",
        flex: 2,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Shipment ID</Typography>;
        },
        renderCell: (params) => {
          return <ReceivingQueueDropdown params={params} />;
        },
      },
      {
        field: "source",
        flex: 1,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Source</Typography>;
        },
      },
    ],
    [
      selectedShipmentIds,
      isSelectAllOn,
      onQueueRowClick,
      tableData,
      onSelectAllClick,
      searchText,
    ]
  );

  const sortDataByModel = useCallback(
    (model, data) => {
      if (model.length !== 0) {
        // find the filter handler based on the column clicked
        const clickedColumnField = createColumnFilters(columns, data).find(
          (e) => e.field === model[0]?.field
        );
        // execute the handler
        // setQueueData(
        return clickedColumnField?.handler(
          model[0]?.sort,
          selectedShipmentIds,
          data
        );
        // );
      } else {
        return data;
      }
    },
    [columns, selectedShipmentIds]
  );

  useEffect(() => {
    const filtered = receivingQueue.filter(
      (order) =>
        order.label.toLowerCase().includes(searchText?.toLowerCase()) ||
        order.manifest
          .map((e) => e.lines)
          .flat()
          .flat()
          .map((e) => [e.item?.OrderNumber, e.item?.PartNumber])
          .flat()
          .map((e) => e.toLowerCase().includes(searchText?.toLowerCase()))
          .some((e) => e) ||
        selectedShipmentIds.includes(order?.id) // Ensure selected rows are included
    );
    setFilteredReceivingQueue(sortDataByModel(sortModel, filtered));
    // eslint-disable-next-line
  }, [searchText, setFilteredReceivingQueue]);

  useEffect(() => {
    setQueueData(tableData);
  }, [tableData]);

  //TODO: Set later for when data is coming in.
  // eslint-disable-next-line
  const [page, setPage] = useState(0);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const generateTablePagination = useCallback(() => {
    return (
      <table>
        <tbody>
          <tr>
            <TablePagination
              count={queueData?.length}
              rowsPerPageOptions={[numRowsPerPage]}
              rowsPerPage={numRowsPerPage}
              onPageChange={handlePageChange}
              page={page}
              sx={{ border: "0px" }}
            />
          </tr>
        </tbody>
      </table>
    );
  }, [page, queueData?.length]);

  return (
    <div className={classes.root}>
      <ReceivingQueueDataGrid
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - ${NAV_BAR_HEIGHT} - 5rem)`,
          minHeight: "20rem",
        }}
        className={classes.table}
        rows={
          isLoading
            ? []
            : queueData.slice(
                page * numRowsPerPage,
                page * numRowsPerPage + numRowsPerPage
              )
        }
        columns={columns}
        pageSize={numRowsPerPage}
        rowsPerPageOptions={[numRowsPerPage]}
        columnBuffer={0}
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        checkboxSelection={false}
        disableSelectionOnClick={true}
        sortingMode="server"
        loading={isLoading}
        sortModel={sortModel}
        onSortModelChange={(model) => {
          setSortModel(model);
          setQueueData(
            sortDataByModel(model, tableData, columns, selectedShipmentIds)
          );
        }}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
          Footer: () =>
            selectedShipmentIds.length > 0 ? (
              <Grid container item alignItems="center" spacing={2}>
                <Grid container item xs={6} justifyContent="flex-start">
                  <Typography sx={{ padding: "8px" }}>
                    {selectedShipmentIds.length} rows selected
                  </Typography>
                </Grid>
                <Grid container item xs={6} justifyContent="flex-end">
                  {generateTablePagination()}
                </Grid>
              </Grid>
            ) : (
              <Grid container item xs={12} justifyContent="flex-end">
                {generateTablePagination()}
              </Grid>
            ),
        }}
      />
    </div>
  );
};

export default ReceivingQueueTable;
