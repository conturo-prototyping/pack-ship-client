import React, { useState, useEffect, useMemo, useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { createColumnFilters } from "../../utils/TableFilters";
import HelpTooltip from "../../components/HelpTooltip";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
} from "../../utils/Constants";
import { API } from "../../services/server";
import ReceivingQueueDropdown from "../ReceivingQueueDropdown";
import { styled } from "@mui/system";
import { getCheckboxColumn } from "../../components/CheckboxColumn";

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
  selectedOrderIds,
  setSelectedOrderIds,
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

  useEffect(async () => {
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
            data?.queue?.ret.forEach((e) => {
              queueTableData.push({
                id: e._id,
                manifest: e.manifest,
                source: e.source,
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
    setSelectedOrderIds,
    setReceivingQueue,
    isMounted,
  ]);

  const onQueueRowClick = useCallback(
    (selectionModel, tableData) => {
      const newselectionOrderIds = handleSelection(selectionModel, tableData);
      setSelectedOrderIds([...newselectionOrderIds]);

      setSelectedOrderNumber(
        tableData?.find(
          (e) => newselectionOrderIds.length > 0 && e.id === selectionModel
        )?.orderNumber ?? null
      );
    },
    [handleSelection, setSelectedOrderNumber, setSelectedOrderIds]
  );

  const onSelectAllClick = useCallback(
    (value, tableData) => {
      setIsSelectAll(value);
    },
    [setSelectedOrderIds]
  );

  const columns = useMemo(
    () => [
      getCheckboxColumn(
        false, // No params to disable on for now.
        selectedOrderIds,
        isSelectAllOn,
        tableData,
        onSelectAllClick,
        onQueueRowClick
      ),
      {
        field: "shipmentId",
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
    [classes.fulfilledQtyHeader]
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
    const filtered = receivingQueue.filter(
      (order) =>
        order?.orderNumber?.toLowerCase().includes(searchText?.toLowerCase()) ||
        order?.items?.filter((e) =>
          e.item?.partNumber?.toLowerCase().includes(searchText?.toLowerCase())
        ).length > 0 ||
        selectedOrderIds.includes(order?.id) // Ensure selected rows are included
    );
    setFilteredReceivingQueue(sortDataByModel(sortModel, filtered));
    // eslint-disable-next-line
  }, [searchText, setFilteredReceivingQueue]);

  useEffect(() => {
    setQueueData(receivingQueue);
  }, [receivingQueue]);

  //TODO: Set later for when data is coming in.
  // eslint-disable-next-line
  const [page, setPage] = useState(0);

  return (
    <div className={classes.root}>
      <ReceivingQueueDataGrid
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
            sortDataByModel(model, tableData, columns, selectedOrderIds)
          );
        }}
      />
    </div>
  );
};

export default ReceivingQueueTable;
