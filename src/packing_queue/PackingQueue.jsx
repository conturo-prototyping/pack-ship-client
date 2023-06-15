import React, { useState, useCallback, useEffect } from "react";
import Search from "../components/Search";
import PackShipTabs from "../components/Tabs";
import CheckboxForm from "../components/CheckboxForm";
import { API } from "../services/server";
import { Box, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CommonButton from "../common/Button";
import PackingSlipDialog from "../packing_slip/PackingSlipDialog";
import PackingQueueTable from "./tables/PackingQueueTable";
import HistoryTable from "./tables/HistoryTable";
import PendingTable from "./tables/PendingTable";
import { useLocalStorage } from "../utils/localStorage";
import { OrderPartNumberSearch } from "../components/OrderAndPartSearchBar";
import { extractHistoryDetails } from "./utils/historyDetails";
import { getSortFromModel } from "./utils/sortModelFunctions";
import { snackbarVariants, usePackShipSnackbar } from "../common/Snackbar";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_RIGHT_MARGIN,
  PACKING_SLIP_LEFT_MARGIN,
  TOP_LEFT_ACTION_BUTTON_WIDTH,
  TOP_LEFT_ACTION_BUTTON_HEIGHT,
} from "../utils/Constants";
import { DestinationTypes } from "../utils/Constants";
import { FileUploader } from "../services/fileUploader";
import { FilePathGenerator } from "../common/FilePathGenerator";

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
}));

const PackingQueue = () => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);

  const enqueueSnackbar = usePackShipSnackbar();

  const [tabValue, setTabValue] = useState(0);

  // SEARCHING
  const [searchString, setSearchString] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [pendingOrderNumber, setPendingOrderNumber] = useState("");
  const [pendingPartNumber, setPendingPartNumber] = useState("");

  // HISTORY
  const [historyLoading, setHistoryLoading] = useState(false);
  const [histTotalCount, setHistTotalCount] = useState(0);
  const [histPageNum, setHistPageNum] = useState(0);
  const [histResultsPerPage, setHistResultsPerPage] = useLocalStorage(
    "packingHistNumRows",
    window.innerHeight > 1440 ? 25 : 10
  );
  const [filteredHist, setFilteredHist] = useState([]);
  const [sortPackHistoryModel, setSortPackHistoryModel] = useLocalStorage(
    "sortPackHistoryModel",
    [
      { field: "orderId", sort: "asc" },
      { field: "label", sort: "asc" },
      { field: "dateCreated", sort: "asc" },
    ]
  );

  // QUEUE
  const [isFulfilledBatchesOn, setIsFulfilledBatchesOn] = useState(true);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [packingQueue, setPackingQueue] = useState([]);
  const [filteredPackingQueue, setFilteredPackingQueue] = useState([]);
  const [sortPackQueueModel, setSortPackQueueModel] = useLocalStorage(
    "sortPackQueueModel",
    [
      { field: "orderNumber", sort: "asc" },
      { field: "part", sort: "asc" },
      { field: "batchQty", sort: "asc" },
      { field: "fulfilledQty", sort: "asc" },
    ]
  );

  // DIALOGS
  const [packingSlipOpen, setPackingSlipOpen] = useState(false);
  const [destination, setDestination] = useState("CUSTOMER");

  // PENDING
  const [sortPackPendingModel, setSortPackPendingModel] = useLocalStorage(
    "sortPackPendingModel",
    [
      { field: "orderId", sort: "asc" },
      { field: "label", sort: "asc" },
      { field: "dateCreated", sort: "asc" },
    ]
  );
  const [filteredPending, setFilteredPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const fetchSearch = useCallback(
    async (sort, pageNumber, oNum, pNum) => {
      if (isMounted && tabValue === 2) setHistoryLoading(true);
      await API.searchPackingSlipsHistory(
        sort?.sortBy,
        sort?.sortOrder,
        oNum,
        pNum,
        histResultsPerPage,
        pageNumber
      )
        .then((data) => {
          if (data && isMounted) {
            const tableData = extractHistoryDetails(data?.packingSlips);
            setFilteredHist(tableData);
            setHistTotalCount(data?.totalCount);
          }
        })
        .finally(() => {
          setHistoryLoading(false);
        });
    },
    // eslint-disable-next-line
    [histResultsPerPage, isMounted, tabValue]
  );

  const fetchPendingData = useCallback(async () => {
    if (isMounted) {
      setPendingLoading(true);
      await API.getPendingPackingQueue()
        .then((data) => {
          if (data && isMounted) {
            const tableData = extractHistoryDetails(data?.packingSlips);
            setFilteredPending(tableData);
          }
        })
        .finally(() => {
          setPendingLoading(false);
        });
    }
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) fetchPendingData();
  }, [isMounted, fetchPendingData]);

  function onPackingSlipClick() {
    setTimeout(() => setPackingSlipOpen(true), 0);
  }

  function onPackingSlipClose() {
    setPackingSlipOpen(false);
  }

  const onPackingSlipSubmit = useCallback(
    async (filledForm, orderNum, destination) => {
      const items = filledForm.map((e) => {
        e.routerUploadFilePath = FilePathGenerator.createPackingSlipRouterPath(
          e._id
        );

        return {
          item: e._id,
          qty: e.packQty,
          destinationCode: e.destinationCode,
          routerUploadFilePath: e.routerUploadFilePath,
        };
      });

      await Promise.all(
        filledForm.map(async (e) => {
          await FileUploader.uploadFile(e.routerUploadFilePath, e.uploadFile);
        })
      );

      API.createPackingSlip(
        items,
        filledForm[0].customer,
        orderNum,
        destination
      )
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

          fetchPendingData();

          onPackingSlipClose();
          enqueueSnackbar("Packing slip created!", snackbarVariants.success);
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    },
    [filteredPackingQueue, packingQueue, enqueueSnackbar, fetchPendingData]
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

  const onPendingClearClick = async () => {
    setPendingOrderNumber("");
    setPendingPartNumber("");
    await fetchPendingData();
  };

  async function onPendingSearchClick() {
    setFilteredPending(
      filteredPending.filter((order) => {
        let retVal = false;

        if (pendingOrderNumber !== "" && pendingOrderNumber !== undefined)
          retVal = order.orderNumber
            .toLowerCase()
            .includes(pendingOrderNumber.toLowerCase());

        if (pendingPartNumber !== "" && pendingPartNumber !== undefined)
          retVal |= order.items.some((e) =>
            e.item.partNumber
              .toLowerCase()
              .includes(pendingPartNumber.toLowerCase())
          );

        return retVal;
      })
    );
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

  useEffect(() => {
    if (filteredPackingQueue)
      setDestination(
        filteredPackingQueue.filter((e) => selectedOrderIds.includes(e.id))[0]
          ?.destination || DestinationTypes.CUSTOMER
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPackingQueue]);

  useEffect(() => {
    fetchSearch(
      getSortFromModel(sortPackHistoryModel),
      histPageNum,
      orderNumber,
      partNumber
    );
  }, [
    histResultsPerPage,
    fetchSearch,
    histPageNum,
    orderNumber,
    partNumber,
    sortPackHistoryModel,
  ]);

  return (
    <Box className={classes.box}>
      <Grid
        className={classes.topBarGrid}
        container
        justifyContent="start"
        spacing={2}>
        <Grid container item xs={12} spacing={2}>
          {tabValue === 2 && (
            <OrderPartNumberSearch
              partNumber={partNumber}
              orderNumber={orderNumber}
              onClearClick={onHistoryClearClick}
              onSearchClick={onHistorySearchClick}
              setOrderNumber={setOrderNumber}
              setPartNumber={setPartNumber}
            />
          )}

          {tabValue === 1 && (
            <OrderPartNumberSearch
              partNumber={pendingPartNumber}
              orderNumber={pendingOrderNumber}
              onClearClick={onPendingClearClick}
              onSearchClick={onPendingSearchClick}
              setOrderNumber={setPendingOrderNumber}
              setPartNumber={setPendingPartNumber}
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
                  sx={{
                    minWidth: TOP_LEFT_ACTION_BUTTON_WIDTH,
                    maxHeight: TOP_LEFT_ACTION_BUTTON_HEIGHT,
                  }}
                />
              </Grid>
              <Grid container item justifyContent="start" xs={6}>
                <Search
                  onSearch={onSearch}
                  autoFocus
                  searchString={searchString}
                  setSearchString={setSearchString}
                />
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
                            _id: e._id,
                            id: `${e._id}--${e.destinationCode}`,
                            part: `${e.partNumber} - ${e.partRev} (Batch ${e.batch})`,
                            batchQty: e.batchQty,
                            customer: e.customer,
                            orderNumber: e.orderNumber,
                            fulfilledQty: e.packedQty,
                            partDescription: e.partDescription,
                            destination: e.destination,
                            destinationCode: e.destinationCode,
                            url: null, //TODO
                          });
                        });
                        setFilteredPackingQueue(finalData);
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
              setSearchString("");
              setIsFulfilledBatchesOn(true);
              setSelectedOrderIds([]);
            }}
            queueTotal={filteredPackingQueue?.length}
            pendingTotal={filteredPending?.length}
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
                fetchData={fetchSearch}
                histTotalCount={histTotalCount}
                historyLoading={historyLoading}
                filteredData={filteredHist}
                histResultsPerPage={histResultsPerPage}
                orderNumber={orderNumber}
                partNumber={partNumber}
                pageNumber={histPageNum}
                onPageChange={onHistPageChange}
                setHistResultsPerPage={setHistResultsPerPage}
                hasRouterUploads
              />
            }
            pendingTab={
              <PendingTable
                sortModel={sortPackPendingModel}
                setSortModel={setSortPackPendingModel}
                pageNumber={histPageNum}
                filteredData={filteredPending}
                isLoading={pendingLoading}
                fetchData={fetchPendingData}
                hasRouterUploads
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
            ?.filter((e) => selectedOrderIds.includes(e.id))
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
      </Grid>
    </Box>
  );
};

export default PackingQueue;
