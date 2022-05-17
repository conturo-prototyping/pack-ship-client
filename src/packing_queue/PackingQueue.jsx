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
  box: {
    boxSizing: 'border-box',
    height: '100%',
  },
  topBarGrid: {
    boxSizing: 'border-box',
    height: '5.5rem',
    marginBottom: '1rem!important',
    paddingTop: '1rem!important',
    paddingLeft: '1rem!important',
  },
  bottomBarGrid: {
    boxSizing: 'border-box',
    marginTop: '1rem!important',
    marginBottom: '0',
    height: '3rem',
    paddingRight: '1rem'
  }
}));

const PackingQueue = () => {
  const classes = useStyle();

  const [searchString, setSearchString] = useState("");
  const [tabValue, setTabValue] = useState(0);

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

  const onPackingSlipSubmit = useCallback(
    (filledForm, orderNum) => {
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

          // Find updated ids
          const updatedIds = updatedFulfilled.map((e) => e.id);

          // Replace the items with the updated ones based on id
          const updatedFilteredPackingQueue = filteredPackingQueue.map((e) => {
            if (updatedIds.includes(e.id)) {
              return updatedFulfilled.find((a) => e.id === a.id);
            }
            return e;
          });
          const updatedPackingQueue = packingQueue.map((e) => {
            if (updatedIds.includes(e.id)) {
              return updatedFulfilled.find((a) => e.id === a.id);
            }
            return e;
          });

          // Replace the list with the updated version
          setFilteredPackingQueue(updatedFilteredPackingQueue);
          setPackingQueue(updatedPackingQueue);

          onPackingSlipClose();
        })
        .catch(() => {
          alert("An error occurred submitting packing slip");
        });
    },
    [filteredPackingQueue, packingQueue]
  );

  function onSearch(value) {
    setSearchString(value);
  }

  return (
    <Box
      className={classes.box}
    >
      <Grid
        className={classes.topBarGrid}
        container
        justifyContent="start"
        spacing={2}
      >
        <Grid container item xs={"auto"}>
          <CommonButton
            label="Make Packing Slip"
            disabled={selectedOrderIds.length === 0 || tabValue !== 0}
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
                const tmpPackQueue = filteredPackingQueue.filter(
                  (e) => e.fulfilledQty < e.batchQty
                );
                const orderIds = tmpPackQueue
                  .filter((e) => selectedOrderIds.includes(e.id))
                  .map((e) => e.id);
                setSelectedOrderIds(orderIds);
                setSelectedOrderNumber(
                  orderIds.length === 0 ? null : selectedOrderNumber
                );
                setFilteredPackingQueue(tmpPackQueue);
              } else {
                setFilteredPackingQueue(packingQueue);
              }
            }}
            checked={isFulfilledBatchesOn}
          />
        </Grid>
      </Grid>

      <PackShipTabs
        onTabChange={(_, v) => {
          setTabValue(v);
        }}
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
            isShowUnfinishedBatches={true /*isShowUnfinishedBatches*/}
            setSelectedOrderIds={setSelectedOrderIds}
            setSelectedOrderNumber={setSelectedOrderNumber}
            searchString={searchString}
            isFulfilledBatchesOn={isFulfilledBatchesOn}
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
        className={classes.bottomBarGrid}
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
