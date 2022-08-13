import React, { useState, useMemo, useCallback, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, TablePagination, Grid } from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";
import { createColumnFilters } from "../../utils/TableFilters";
import { getCheckboxColumn } from "../../components/CheckboxColumn";
import { API } from "../../services/server";
import { PackShipProgress } from "../../common/CircularProgress";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
} from "../../utils/Constants";

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

const recheckIfNeeded = (
  selectedOrderNumber,
  tableData,
  selectionOrderIds,
  setIsSelectAll
) => {
  const selectedOrderNum = selectedOrderNumber;

  const idsWithSelectedOrderNum = tableData
    ?.filter((e) => e.orderNumber === selectedOrderNum)
    .map((e) => e.id);

  setIsSelectAll(
    idsWithSelectedOrderNum.length !== 0 &&
      idsWithSelectedOrderNum.sort().toString() ===
        selectionOrderIds.sort().toString()
  );
};

const applySearch = (packingQueue, searchString) => {
  return packingQueue.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchString.toLowerCase()) ||
      order.part.toLowerCase().includes(searchString.toLowerCase())
  );
};

const applyFulfilledBatchFilter = (packingQueue, checked) => {
  let filteredQueue = [];
  if (!checked) {
    filteredQueue = packingQueue.filter((order) => {
      return order.fulfilledQty < order.batchQty;
    });
  } else {
    filteredQueue = packingQueue;
  }
  return filteredQueue;
};

const ensureSelectionAdded = (packingQueue, allPackingQueue, selectedIds) => {
  if (selectedIds.length > 0) {
    for (let selectedId in selectedIds) {
      if (!packingQueue.map((e) => e.id).includes(selectedIds[selectedId])) {
        const selected = allPackingQueue.find(
          (e) => e.id === selectedIds[selectedId]
        );
        packingQueue = [selected].concat(packingQueue);
      }
    }
  }
  return packingQueue;
};

const PackingQueueTable = ({
  tableData,
  packingQueue,
  selectedOrderNumber,
  selectionOrderIds,
  sortModel,
  setSortModel,
  setPackingQueue,
  setFilteredPackingQueue,
  isShowUnfinishedBatches,
  setSelectedOrderIds,
  setSelectedOrderNumber,
  searchString,
  isFulfilledBatchesOn,
}) => {
  const classes = useStyle();
  const numRowsPerPage = 10;

  const [isMounted, setIsMounted] = useState(false);
  const [queueData, setQueueData] = useState(tableData);
  const [isSelectAllOn, setIsSelectAll] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = useCallback(
    (params) => {
      return (
        selectedOrderNumber !== null &&
        selectedOrderNumber !== params.row.orderNumber
      );
    },
    [selectedOrderNumber]
  );

  const handleSelection = useCallback(
    (selection, tableData) => {
      let newSelection = selectionOrderIds;
      if (selectionOrderIds.includes(selection)) {
        // remove it
        newSelection = selectionOrderIds.filter((e) => e !== selection);
        // if something is deselected then selectAll is false
        setIsSelectAll(false);
      } else {
        // add it
        newSelection.push(selection);

        // if the new selection contains all possible selected order numbers
        // then select all is on
        const selectedOrderNum = tableData?.find(
          (e) => e.id === selection
        )?.orderNumber;
        const idsWithSelectedOrderNum = tableData
          ?.filter((e) => e.orderNumber === selectedOrderNum)
          .map((e) => e.id);

        setIsSelectAll(
          idsWithSelectedOrderNum.sort().toString() ===
            newSelection.sort().toString()
        );
      }
      return newSelection;
    },
    [selectionOrderIds]
  );

  const onSelectAllClick = useCallback(
    (value, tableData, isFulfilledBatchesOn, searchString) => {
      setIsSelectAll(value);
      let selectedOrderIds = [];
      if (value) {
        if (selectionOrderIds.length > 0) {
          // Something is selected, so we need to select the remaining
          // that matach selectedOrderNumber
          selectedOrderIds = tableData
            .filter((e) => e.orderNumber === selectedOrderNumber)
            .map((e) => e.id);
          setSelectedOrderIds(selectedOrderIds);
        } else if (selectionOrderIds.length === 0) {
          // Nothing selected yet, so select the first row and all that match
          // the first row order number
          selectedOrderIds = tableData
            .filter((e) => e.orderNumber === tableData[0]?.orderNumber)
            .map((e) => e.id);
          setSelectedOrderIds(selectedOrderIds);
          setSelectedOrderNumber(
            tableData?.find((e) => e.id === tableData[0].id)?.orderNumber ??
              null
          );
        }
      } else {
        setSelectedOrderIds([]);
        setSelectedOrderNumber(null);
      }

      // ensure deselected rows are remove from searches, filters
      let queue = applyFulfilledBatchFilter(tableData, isFulfilledBatchesOn);
      queue = applySearch(queue, searchString);
      queue = ensureSelectionAdded(queue, tableData, selectedOrderIds);
      setFilteredPackingQueue(queue);
    },
    [
      selectionOrderIds,
      selectedOrderNumber,
      setSelectedOrderIds,
      setSelectedOrderNumber,
      setFilteredPackingQueue,
    ]
  );

  useEffect(() => {
    async function fetchData() {
      if (true /*isShowUnfinishedBatches*/) {
        return await API.getAllWorkOrders();
      } else {
        return await API.getPackingQueue();
      }
    }

    if (isMounted) {
      setIsLoading(true);
      fetchData()
        .then((data) => {
          if (isMounted) {
            let tableData = [];
            data?.forEach((e) => {
              tableData.push({
                id: e._id,
                part: `${e.partNumber} - ${e.partRev} (Batch ${e.batch})`,
                batchQty: e.batchQty,
                customer: e.customer,
                orderNumber: e.orderNumber,
                fulfilledQty: e.packedQty,
                partDescription: e.partDescription,
              });
            });

            tableData = sortDataByModel(
              sortModel,
              tableData,
              columns,
              selectionOrderIds
            );
            setPackingQueue(tableData);
            setFilteredPackingQueue(tableData);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
    // Find the select all state when this first renders since this could re-render from a tab change.
    recheckIfNeeded(
      selectedOrderNumber,
      tableData,
      selectionOrderIds,
      setIsSelectAll
    );

    return () => setIsMounted(false);
    // eslint-disable-next-line
  }, []);

  // const storedTableData = useMemo(() => tableData, [tableData]);

  const staticCols = useMemo(
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

  const sortDataByModel = useCallback(
    (model, data, columns, selectionOrderIds, ignoreSelected = false) => {
      if (model.length !== 0) {
        // find the filter handler based on the column clicked
        const clickedColumnField = createColumnFilters(columns, data).find(
          (e) => e.field === model[0]?.field
        );
        // execute the handler

        return clickedColumnField?.handler(
          model[0]?.sort,
          selectionOrderIds,
          data,
          ignoreSelected
        );
      } else {
        return data;
      }
    },
    []
  );

  const onQueueRowClick = useCallback(
    (selectionModel, tableData, isFulfilledBatchesOn, searchString) => {
      const newselectionOrderIds = handleSelection(selectionModel, tableData);
      setSelectedOrderIds([...newselectionOrderIds]);

      setSelectedOrderNumber(
        tableData?.find(
          (e) => newselectionOrderIds.length > 0 && e.id === selectionModel
        )?.orderNumber ?? null
      );

      // ensure deselected rows are remove from searches, filters
      let queue = applyFulfilledBatchFilter(tableData, isFulfilledBatchesOn);
      queue = applySearch(queue, searchString);
      queue = ensureSelectionAdded(queue, packingQueue, newselectionOrderIds);
      setFilteredPackingQueue(queue);
    },
    [
      handleSelection,
      setSelectedOrderNumber,
      setSelectedOrderIds,
      packingQueue,
      setFilteredPackingQueue,
    ]
  );

  const columns = useMemo(
    () => [
      getCheckboxColumn(
        isDisabled,
        selectionOrderIds,
        isSelectAllOn,
        queueData,
        onSelectAllClick,
        onQueueRowClick,
        isFulfilledBatchesOn,
        searchString
      ),
      ...staticCols,
    ],
    [
      staticCols,
      queueData,
      isDisabled,
      selectionOrderIds,
      isSelectAllOn,
      onSelectAllClick,
      onQueueRowClick,
      isFulfilledBatchesOn,
      searchString,
    ]
  );

  useEffect(() => {
    // When we toggle on, we need to make sure to apply the search and sorting again.

    let queue = applyFulfilledBatchFilter(packingQueue, isFulfilledBatchesOn);
    queue = applySearch(queue, searchString);
    queue = ensureSelectionAdded(queue, packingQueue, selectionOrderIds);
    queue = sortDataByModel(sortModel, queue, columns, selectionOrderIds);
    setFilteredPackingQueue(queue);

    recheckIfNeeded(
      selectedOrderNumber,
      tableData,
      selectionOrderIds,
      setIsSelectAll
    );
    // eslint-disable-next-line
  }, [isFulfilledBatchesOn]);

  useEffect(() => {
    let queue = applySearch(packingQueue, searchString);
    queue = applyFulfilledBatchFilter(queue, isFulfilledBatchesOn);
    queue = ensureSelectionAdded(queue, packingQueue, selectionOrderIds);
    queue = sortDataByModel(sortModel, queue, columns, selectionOrderIds);
    setFilteredPackingQueue(queue);
    // eslint-disable-next-line
  }, [searchString]);

  useEffect(() => {
    setQueueData(tableData);
  }, [tableData]);

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
              count={queueData.length}
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
  }, [page, queueData.length]);

  return (
    <div className={classes.root}>
      <DataGrid
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - 15rem)`,
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
            sortDataByModel(model, tableData, columns, selectionOrderIds)
          );
        }}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
          Footer: () =>
            selectionOrderIds.length > 0 ? (
              <Grid container item alignItems="center" spacing={2}>
                <Grid container item xs={6} justifyContent="flex-start">
                  <Typography sx={{ padding: "8px" }}>
                    {selectionOrderIds.length} rows selected
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

export default PackingQueueTable;
