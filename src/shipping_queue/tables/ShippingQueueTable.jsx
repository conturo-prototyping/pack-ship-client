import React, { useState, useEffect, useMemo, useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, TablePagination, Grid } from "@mui/material";
import { styled } from "@mui/system";
import { createColumnFilters } from "../../utils/TableFilters";
import { getCheckboxColumn } from "../../components/CheckboxColumn";
import ShipQueuePackSlipDrowdown from "./ShipQueuePackSlipDropdown";
import { API } from "../../services/server";
import CreateShipmentDialog from "../../create_shipment/CreateShipmentDialog";

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

const ShippingQueueDataGrid = styled(DataGrid)`
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

const ShippingQueueTable = ({
  shippingQueue,
  tableData,
  sortModel,
  setSortModel,
  selectedOrderIds,
  setSelectedOrderIds,
  onCreateShipmentClose,
  setShippingQueue,
  setFilteredShippingQueue,
  createShipmentOpen,
  currentDialogState,
  setCurrentDialogState,
  searchText,
}) => {
  const classes = useStyle();
  const [queueData, setQueueData] = useState(tableData);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isSelectAllOn, setIsSelectAll] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const numRowsPerPage = 10;

  const isDisabled = useCallback(
    (params) => {
      return (
        selectedCustomerId !== null &&
        selectedCustomerId !== params.row.customer?._id
      );
    },
    [selectedCustomerId]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reloadData = useCallback(async () => {
    async function fetchData() {
      const data = await Promise.all([API.getShippingQueue()]);
      return { queue: data[0] };
    }

    if (isMounted) {
      setIsLoading(true);
      fetchData()
        .then((data) => {
          if (isMounted) {
            // Gather the queue data for the table
            let queueTableData = [];
            data?.queue?.packingSlips.forEach((e) => {
              queueTableData.push({
                id: e._id,
                orderNumber: e.orderNumber,
                packingSlipId: e.packingSlipId,
                customer: e.customer,
                items: e.items,
              });
            });

            // The set state order is important
            setSelectedCustomerId(null);
            setSelectedOrderIds([]);
            queueTableData = sortDataByModel(sortModel, queueTableData);
            setShippingQueue(queueTableData);
            setFilteredShippingQueue(queueTableData);
            setIsSelectAll(false);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line
  }, [
    setFilteredShippingQueue,
    setSelectedOrderIds,
    setShippingQueue,
    isMounted,
  ]);

  useEffect(() => {
    if (isMounted) reloadData();
  }, [reloadData, isMounted]);

  const handleSelection = useCallback(
    (selection, tableData) => {
      let newSelection = selectedOrderIds;
      if (selectedOrderIds.includes(selection)) {
        // remove it
        newSelection = selectedOrderIds.filter((e) => e !== selection);
        // if something is deselected then selectAll is false
        setIsSelectAll(false);
      } else {
        // add it
        newSelection.push(selection);

        // if the new selection contains all possible selected order numbers
        // then select all is on
        const selectedCustId = tableData?.find((e) => e.id === selection)
          ?.customer._id;
        const idsWithSelectedCustId = tableData
          ?.filter((e) => e.customer._id === selectedCustId)
          .map((e) => e.id);

        setIsSelectAll(
          idsWithSelectedCustId.sort().toString() ===
            newSelection.sort().toString()
        );
      }
      return newSelection;
    },
    [selectedOrderIds]
  );

  const onRowClick = useCallback(
    (selectionModel, tableData) => {
      const newSelectedOrderIds = handleSelection(selectionModel, tableData);
      setSelectedOrderIds([...newSelectedOrderIds]);

      setSelectedCustomerId(
        tableData?.find(
          (e) => newSelectedOrderIds.length > 0 && e.id === selectionModel
        )?.customer?._id ?? null
      );
    },
    [handleSelection, setSelectedOrderIds]
  );

  const onSelectAll = useCallback(
    (value, tableData) => {
      setIsSelectAll(value);

      if (value) {
        if (selectedOrderIds.length > 0) {
          // Something is selected, so we need to select the remaining
          // that matach selectedOrderNumber
          setSelectedOrderIds(
            tableData
              .filter((e) => e.customer?._id === selectedCustomerId)
              .map((e) => e.id)
          );
        } else if (selectedOrderIds.length === 0) {
          // Nothing selected yet, so select the first row and all that match
          // the first row order number

          setSelectedOrderIds(
            tableData
              .filter((e) => e.customer?._id === tableData[0]?.customer?._id)
              .map((e) => e.id)
          );
          setSelectedCustomerId(
            tableData?.find((e) => e.id === tableData[0].id)?.customer?._id ??
              null
          );
        }
      } else {
        setSelectedOrderIds([]);
        setSelectedCustomerId(null);
      }
    },
    [selectedOrderIds, selectedCustomerId, setSelectedOrderIds]
  );

  const columns = useMemo(
    () => [
      getCheckboxColumn(
        isDisabled,
        selectedOrderIds,
        isSelectAllOn,
        tableData,
        onSelectAll,
        onRowClick
      ),
      {
        field: "orderNumber",
        flex: 1,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Order</Typography>;
        },
      },
      {
        field: "packingSlipId",
        renderCell: (params) => {
          return <ShipQueuePackSlipDrowdown params={params} />;
        },
        flex: 2,
        renderHeader: (params) => {
          return <Typography sx={{ fontWeight: 900 }}>Packing Slip</Typography>;
        },
      },
    ],
    [
      isDisabled,
      isSelectAllOn,
      onRowClick,
      onSelectAll,
      selectedOrderIds,
      tableData,
    ]
  );

  const packingSlipIds = useMemo(() => {
    return shippingQueue
      .filter((e) => selectedOrderIds.includes(e.id))
      .map((e) => e.id);
  }, [shippingQueue, selectedOrderIds]);

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
          selectedOrderIds,
          data
        );
        // );
      } else {
        return data;
      }
    },
    [columns, selectedOrderIds]
  );

  useEffect(() => {
    const filtered = shippingQueue.filter(
      (order) =>
        order?.orderNumber?.toLowerCase().includes(searchText?.toLowerCase()) ||
        order?.items?.filter((e) =>
          e.item?.partNumber?.toLowerCase().includes(searchText?.toLowerCase())
        ).length > 0 ||
        selectedOrderIds.includes(order?.id) // Ensure selected rows are included
    );
    setFilteredShippingQueue(sortDataByModel(sortModel, filtered));
    // eslint-disable-next-line
  }, [searchText, setFilteredShippingQueue]);

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
      <ShippingQueueDataGrid
        sx={{ border: "none", height: "65vh", minHeight: "20rem" }}
        className={classes.table}
        onRowClick={(params) => {
          let tmpData = [...queueData];
          const tmpIndex = tmpData.findIndex((e) => {
            return e.id === params.id;
          });
          tmpData[tmpIndex].open = !tmpData || !tmpData[tmpIndex].open;
          setQueueData(tmpData);
        }}
        rows={queueData.slice(
          page * numRowsPerPage,
          page * numRowsPerPage + numRowsPerPage
        )}
        rowHeight={65}
        columns={columns}
        pageSize={numRowsPerPage}
        rowsPerPageOptions={[numRowsPerPage]}
        columnBuffer={0}
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        checkboxSelection={false}
        disableSelectionOnClick={true}
        editMode="row"
        loading={isLoading}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={(model) => {
          setSortModel(model);
          setQueueData(sortDataByModel(model, tableData));
        }}
        components={{
          Footer: () =>
            selectedOrderIds.length > 0 ? (
              <Grid container alignItems="center" spacing={2}>
                <Grid container item xs={6} justifyContent="flex-start">
                  <Typography sx={{ padding: "8px" }}>
                    {selectedOrderIds.length} rows selected
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

      <CreateShipmentDialog
        customer={
          shippingQueue.filter((e) => selectedOrderIds.includes(e.id))[0]
            ?.customer
        }
        packingSlipIds={packingSlipIds}
        open={createShipmentOpen}
        onClose={onCreateShipmentClose}
        currentState={currentDialogState}
        setCurrentState={setCurrentDialogState}
        parts={shippingQueue
          .filter((e) => selectedOrderIds.includes(e.id))
          .reduce(
            (result, current) =>
              result.concat(
                current.items.map((e) => {
                  return { ...e, id: e._id };
                })
              ),
            []
          )}
        reloadData={reloadData}
      />
    </div>
  );
};

export default ShippingQueueTable;
