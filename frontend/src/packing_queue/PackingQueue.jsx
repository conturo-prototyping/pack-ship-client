import React, { useState, useCallback } from "react";
import Search from "../components/Search";
import PackShipTabs from "../components/Tabs";
import CheckboxForm from "../components/CheckboxForm";
import { API } from "../services/server";
import { Box, Button, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Link } from "react-router-dom";
import { ROUTE_SHIPMENTS } from "../router/router";
import CommonButton from "../common/Button";
import PackingSlipDialog from "../packing_slip/PackingSlipDialog";
import PackingQueueTable from "./tables/PackingQueueTable";
import HistoryTable from "./tables/HistoryTable";
import { useLocalStorage } from "../utils/localStorage";

const useStyle = makeStyles((theme) => ({
  topBarGrid: {
    paddingBottom: "20px",
  },
  navButton: {
    paddingTop: "20px",
  },
}));

const PackingQueue = () => {
  const classes = useStyle();

  const [searchString, setSearchString] = useState("");

  // const [isShowUnfinishedBatches, setIsShowUnfinishedBatches] = useState(true);
  const [isFulfilledBatchesOn, setIsFulfilledBatchesOn] = useState(true);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [packingQueue, setPackingQueue] = useState([]);
  const [filteredPackingQueue, setFilteredPackingQueue] = useState([]);
  const [packingSlipOpen, setPackingSlipOpen] = useState(false);
  const [sortPackQueueModel, setSortPackQueueModel] = useLocalStorage(
    "sortPackQueueModel",
    [
      { field: "orderNumber", sort: "asc" },
      { field: "part", sort: "asc" },
      { field: "batchQty", sort: "asc" },
      { field: "fulfilledQty", sort: "asc" },
    ]
  );
  const [sortPackHistoryModel, setSortPackHistoryModel] = useLocalStorage(
    "sortPackHistoryModel",
    [
      { field: "orderId", sort: "asc" },
      { field: "packingSlipId", sort: "asc" },
      { field: "dateCreated", sort: "asc" },
    ]
  );
  function onPackingSlipClick() {
    setTimeout(() => setPackingSlipOpen(true), 0);
  }

  function onPackingSlipClose() {
    setPackingSlipOpen(false);
  }

  const onPackingSlipSubmit = useCallback((filledForm, orderNum) => {
    const items = filledForm.map((e) => {
      return { item: e.id, qty: e.packQty };
    });
    API.createPackingSlip(items, filledForm[0].customer, orderNum)
      .then(() => {
        // update the fullfilled Qty
        const updatedFulfilled = filledForm.map((e) => {
          let tmp = {
            ...e,
            fulfilledQty: e.fulfilledQty + parseInt(e.packQty),
          };
          delete tmp.packQty;
          return tmp;
        });

        const updatedPackingQueue = [...filteredPackingQueue]

        // Find all the replacements
        const updatedFulfilledIndices = updatedFulfilled.map((e) =>
          filteredPackingQueue.findIndex((f) => f.id === e.id)
        );

        // Replace the old versions with the new versions. 
        updatedFulfilledIndices.forEach((e, i) => updatedPackingQueue[e] = updatedFulfilled[i]);

        // Replace the list with the updated version
        setFilteredPackingQueue(updatedPackingQueue);

        onPackingSlipClose();
      })
      .catch(() => {
        alert("An error occurred submitting packing slip");
      });
  }, [filteredPackingQueue]);

  function onSearch(value) {
    setSearchString(value);
  }

  return (
    <Box p="40px">
      <Grid
        className={classes.topBarGrid}
        container
        justifyContent="start"
        spacing={2}
      >
        <Grid container item xs={"auto"}>
          <CommonButton
            label="Make Packing Slip"
            disabled={selectedOrderIds.length === 0}
            onClick={onPackingSlipClick}
          />
        </Grid>
        <Grid container justifyContent="start" item xs={6}>
          <Search onSearch={onSearch} />
        </Grid>
        <Grid container item xs justifyContent="flex-end">
          <CheckboxForm
            label="Show Unfinished Batches"
            disabled={true}
            onChange={() => console.log("not implemented yet")}
            checked={true /*isShowUnfinishedBatches*/}
          />
        </Grid>
        <Grid container item xs justifyContent="flex-end">
          <CheckboxForm
            label="Show Fulfilled Batches"
            onChange={(checked) => {
              setIsFulfilledBatchesOn(checked);

              if (isFulfilledBatchesOn) {
                setFilteredPackingQueue(
                  filteredPackingQueue.filter(
                    (e) => e.fulfilledQty < e.batchQty
                  )
                );
              } else {
                setFilteredPackingQueue(packingQueue);
              }
            }}
            checked={isFulfilledBatchesOn}
          />
        </Grid>
      </Grid>

      <PackShipTabs
        queueTotal={packingQueue?.length}
        queueTab={
          <PackingQueueTable
            tableData={filteredPackingQueue}
            packingQueue={packingQueue}
            selectedOrderNumber={selectedOrderNumber}
            selectionOrderIds={selectedOrderIds}
            sortModel={sortPackQueueModel}
            setSortModel={setSortPackQueueModel}
            setPackingQueue={setPackingQueue}
            setFilteredPackingQueue={setFilteredPackingQueue}
            isShowUnfinishedBatches={true/*isShowUnfinishedBatches*/}
            setSelectedOrderIds={setSelectedOrderIds}
            setSelectedOrderNumber={setSelectedOrderNumber}
            searchString={searchString}
          />
        }
        historyTab={
          <HistoryTable
            sortModel={sortPackHistoryModel}
            setSortModel={setSortPackHistoryModel}
            searchString={searchString}
          />
        }
      />

      <PackingSlipDialog
        onSubmit={onPackingSlipSubmit}
        open={packingSlipOpen}
        onClose={onPackingSlipClose}
        orderNum={selectedOrderNumber}
        title={`Create Packing Slip for ${selectedOrderNumber}`}
        parts={filteredPackingQueue
          .filter((e) => selectedOrderIds.includes(e.id))
          .map((e) => {
            return {
              ...e,
              packQty:
                e.fulfilledQty > e.batchQty ? 0 : e.batchQty - e.fulfilledQty,
            };
          })}
      />

      <Grid
        className={classes.navButton}
        container
        item
        xs
        justifyContent="flex-end"
      >
        <Button component={Link} to={ROUTE_SHIPMENTS} variant="contained">
          Shipments
        </Button>
      </Grid>
    </Box>
  );
};

export default PackingQueue;
