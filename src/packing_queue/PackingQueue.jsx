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
import { snackbarVariants, usePackShipSnackbar } from "../common/Snackbar";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  PACKING_SLIP_RIGHT_MARGIN,
  PACKING_SLIP_LEFT_MARGIN,
} from "../utils/Constants";
import { DestinationTypes } from "../utils/Constants";

const useStyle = makeStyles((theme) => ({
  box: {
    boxSizing: "border-box",
    marginRight: PACKING_SLIP_RIGHT_MARGIN,
    marginLeft: PACKING_SLIP_LEFT_MARGIN,
  },
  topBarGrid: {
    boxSizing: "border-box",
    height: "5rem",
    paddingTop: PACKING_SLIP_TOP_MARGIN,
    marginBottom: "1rem!important",
  },
  bottomBarGrid: {
    boxSizing: "border-box",
    marginTop: "1rem!important",
    marginBottom: PACKING_SLIP_BOTTOM_MARGIN,
    height: "3rem",
  },
}));

const PackingQueue = () => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);

  const enqueueSnackbar = usePackShipSnackbar();
  const [searchString, setSearchString] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [histTotalCount, setHistTotalCount] = useState(0);
  const [histPageNum, setHistPageNum] = useState(0);
  const histResultsPerPage = 10;

  // const [isShowUnfinishedBatches, setIsShowUnfinishedBatches] = useState(true);
  const [isFulfilledBatchesOn, setIsFulfilledBatchesOn] = useState(true);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [packingQueue, setPackingQueue] = useState([]);
  const [filteredPackingQueue, setFilteredPackingQueue] = useState([]);
  const [filteredHist, setFilteredHist] = useState([]);
  const [packingSlipOpen, setPackingSlipOpen] = useState(false);
  const [destination, setDestination] = useState("CUSTOMER");
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
      if (isMounted && tabValue === 1) setHistoryLoading(true);
      await API.searchPackingSlipsHistory(
        sort.sortBy,
        sort.sortOrder,
        oNum,
        pNum,
        histResultsPerPage,
        pageNumber
      )
        .then((data) => {
          if (data) {
            if (isMounted) {
              let tableData = extractHistoryDetails(data?.packingSlips);
              setFilteredHist(tableData);
              setHistTotalCount(data?.totalCount);
            }
          }
        })
        .finally(() => {
          setHistoryLoading(false);
        });
    },
    // eslint-disable-next-line
    [histResultsPerPage, isMounted, tabValue]
  );

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  function onPackingSlipClick() {
    setTimeout(() => setPackingSlipOpen(true), 0);
  }

  function onPackingSlipClose() {
    setPackingSlipOpen(false);
  }

  const onPackingSlipSubmit = useCallback(
    (filledForm, orderNum, destination) => {
      const items = filledForm.map((e) => {
        return { item: e.id, qty: e.packQty };
      });
      API.createPackingSlip(
        items,
        filledForm[0].customer,
        orderNum,
        destination
      )
        .then(() => {
          if (destination !== DestinationTypes.VENDOR) {
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
            const updatedFilteredPackingQueue = filteredPackingQueue.map(
              (e) => {
                if (updatedIds.includes(e.id)) {
                  return updatedFulfilled.find((a) => e.id === a.id);
                }
                return e;
              }
            );
            const updatedPackingQueue = packingQueue.map((e) => {
              if (updatedIds.includes(e.id)) {
                return updatedFulfilled.find((a) => e.id === a.id);
              }
              return e;
            });

            // Replace the list with the updated version
            setFilteredPackingQueue(updatedFilteredPackingQueue);
            setPackingQueue(updatedPackingQueue);
          }

          onPackingSlipClose();
          enqueueSnackbar("Packing slip created!", snackbarVariants.success);
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    },
    [filteredPackingQueue, packingQueue, enqueueSnackbar]
  );

  function onSearch(value) {
    setSearchString(value);
  }

  async function onHistorySearchClick() {
    setHistPageNum(0);
    await fetchSearch(
      getSortFromModel(sortPackHistoryModel),
      0,
      orderNumber,
      partNumber
    );
  }

  async function onHistoryClearClick() {
    setOrderNumber("");
    setPartNumber("");
    setHistPageNum(0);
    await fetchSearch(getSortFromModel(sortPackHistoryModel), 0, "", "");
  }

  const onHistPageChange = useCallback(
    async (pageNumber) => {
      setHistPageNum(pageNumber);
      await fetchSearch(
        getSortFromModel(sortPackHistoryModel),
        pageNumber,
        orderNumber,
        partNumber
      );
    },
    [fetchSearch, sortPackHistoryModel, orderNumber, partNumber]
  );

  return (
    <Box className={classes.box}>
      <Grid
        className={classes.topBarGrid}
        container
        justifyContent="start"
        spacing={2}>
        <Grid container item xs={12} spacing={2}>
          {tabValue === 1 && (
            <OrderPartNumberSearch
              partNumber={partNumber}
              orderNumber={orderNumber}
              onClearClick={onHistoryClearClick}
              onSearchClick={onHistorySearchClick}
              setOrderNumber={setOrderNumber}
              setPartNumber={setPartNumber}
            />
          )}

          {tabValue === 0 && (
            <Grid
              container
              item
              xs={12}
              spacing={2}
              sx={{ marginBottom: "1rem!important" }}>
              <Grid container item xs={"auto"}>
                <CommonButton
                  label="Make Packing Slip"
                  disabled={selectedOrderIds.length === 0 || tabValue !== 0}
                  onClick={onPackingSlipClick}
                />
              </Grid>
              <Grid container item justifyContent="start" xs={6}>
                <Search onSearch={onSearch} autoFocus />
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
          )}
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
                histResultsPerPage={histResultsPerPage}
                orderNumber={orderNumber}
                partNumber={partNumber}
                pageNumber={histPageNum}
                onPageChange={onHistPageChange}
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
          onDestinationChange={(newValue) => {
            setDestination(newValue);
          }}
          destination={destination}
        />

        <Grid
          className={classes.bottomBarGrid}
          container
          item
          xs
          justifyContent="flex-end">
          <Button
            component={Link}
            to={ROUTE_SHIPMENTS}
            variant="contained"
            color="secondary"
            sx={{ marginRight: "0px" }}>
            Go to Shipping
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PackingQueue;
