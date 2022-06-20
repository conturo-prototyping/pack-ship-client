import React, { useState, useCallback, useEffect } from "react";
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
import { OrderPartNumberSearch } from "../components/OrderAndPartSearchBar";
import { extractHistoryDetails } from "./utils/historyDetails";
import { getSortFromModel } from "./utils/sortModelFunctions";

const useStyle = makeStyles((theme) => ({
  box: {
    boxSizing: "border-box",
    height: "100%",
  },
  topBarGrid: {
    boxSizing: "border-box",
    height: "5.5rem",
    marginBottom: "1rem!important",
    paddingTop: "1rem!important",
    paddingLeft: "1rem!important",
  },
  bottomBarGrid: {
    boxSizing: "border-box",
    marginTop: "1rem!important",
    marginBottom: "0",
    height: "3rem",
    paddingRight: "1rem",
  },
}));

const PackingQueue = () => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);

  const [searchString, setSearchString] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [histTotalCount, setHistTotalCount] = useState(0);
  const histResultsPerPage = 10;

  // const [isShowUnfinishedBatches, setIsShowUnfinishedBatches] = useState(true);
  const [isFulfilledBatchesOn, setIsFulfilledBatchesOn] = useState(true);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [packingQueue, setPackingQueue] = useState([]);
  const [filteredPackingQueue, setFilteredPackingQueue] = useState([]);
  const [filteredHist, setFilteredHist] = useState([]);
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

  const fetchSearch = useCallback(
    async (sort, pageNumber, oNum, pNum) => {
      if (isMounted && tabValue === 1)
        await API.searchPackingSlipsHistory(
          sort.sortBy,
          sort.sortOrder,
          oNum,
          pNum,
          histResultsPerPage,
          pageNumber
        ).then((data) => {
          if (data) {
            if (isMounted) {
              let tableData = extractHistoryDetails(data?.packingSlips);
              setFilteredHist(tableData);
              setHistTotalCount(data?.totalCount);
            }
          }
        });
    },
    // eslint-disable-next-line
    [histResultsPerPage, isMounted, tabValue]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setHistoryLoading(true);
      fetchSearch(getSortFromModel(sortPackHistoryModel), 0, "", "").finally(
        () => {
          setHistoryLoading(false);
        }
      );
    }
    // eslint-disable-next-line
  }, [fetchSearch, isMounted]);

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

  async function onHistorySearchClick() {
    setHistoryLoading(true);
    await fetchSearch(
      getSortFromModel(sortPackHistoryModel),
      0,
      orderNumber,
      partNumber
    );
    setHistoryLoading(false);
  }

  async function onHistoryClearClick() {
    setOrderNumber("");
    setPartNumber("");
    setHistoryLoading(true);
    await fetchSearch(getSortFromModel(sortPackHistoryModel), 0, "", "");
    setHistoryLoading(false);
  }

  return (
    <Box className={classes.box}>
      <Grid
        className={classes.topBarGrid}
        container
        justifyContent="start"
        spacing={2}
      >
        <Grid container item xs={12} spacing={2}>
          {tabValue === 0 ? (
            <Grid container spacing={2}>
              <Grid container item xs={"auto"}>
                <CommonButton
                  label="Make Packing Slip"
                  disabled={selectedOrderIds.length === 0 || tabValue !== 0}
                  onClick={onPackingSlipClick}
                />
              </Grid>
              <Grid container item justifyContent="start" xs={6}>
                <Search onSearch={onSearch} />
              </Grid>
            </Grid>
          ) : (
            <OrderPartNumberSearch
              partNumber={partNumber}
              orderNumber={orderNumber}
              onClearClick={onHistoryClearClick}
              onSearchClick={onHistorySearchClick}
              setOrderNumber={setOrderNumber}
              setPartNumber={setPartNumber}
            />
          )}

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
              onChange={async (checked) => {
                const finalData = [];
                async function fetchData() {
                  if (true /*isShowUnfinishedBatches*/) {
                    return await API.getAllWorkOrders();
                  } else {
                    return await API.getPackingQueue();
                  }
                }
                await fetchData().then((data) => {
                  if (isMounted) {
                    data?.forEach((e) => {
                      finalData.push({
                        id: e._id,
                        part: `${e.partNumber} - ${e.partRev} (Batch ${e.batch})`,
                        batchQty: e.batchQty,
                        customer: e.customer,
                        orderNumber: e.orderNumber,
                        fulfilledQty: e.packedQty,
                        partDescription: e.partDescription,
                      });
                    });

                    if (isFulfilledBatchesOn) {
                      const tmpPackQueue = finalData.filter(
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
                      setFilteredPackingQueue(finalData);
                    }
                  }
                });

                setIsFulfilledBatchesOn(checked);
              }}
              checked={isFulfilledBatchesOn}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
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
                fetchSearch={fetchSearch}
                histTotalCount={histTotalCount}
                historyLoading={historyLoading}
                filteredHist={filteredHist}
                setFilteredHist={setFilteredHist}
                histResultsPerPage={histResultsPerPage}
                orderNumber={orderNumber}
                partNumber={partNumber}
              />
            }
          />
        </Grid>

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
          <Button
            component={Link}
            to={ROUTE_SHIPMENTS}
            variant="contained"
            color="secondary"
          >
            Go to Shipping
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PackingQueue;
