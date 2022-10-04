import React, { useEffect, useCallback, useState } from "react";
import PackShipTabs from "../components/Tabs";
import { Box, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Search from "../components/Search";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  PACKING_SLIP_RIGHT_MARGIN,
  PACKING_SLIP_LEFT_MARGIN,
} from "../utils/Constants";
import ReceivingQueueTable from "./tables/ReceivingQueueTable";
import { useLocalStorage } from "../utils/localStorage";
import CommonButton from "../common/Button";
import { OrderPartNumberSearch } from "../components/OrderAndPartSearchBar";
import ReceivingHistoryTable from "./tables/ReceivingHistoryTable";
import { getSortFromModel } from "./utils/sortModelFunctions";

const useStyle = makeStyles((theme) => ({
  box: {
    boxSizing: "border-box",
    marginRight: PACKING_SLIP_RIGHT_MARGIN,
    marginLeft: PACKING_SLIP_LEFT_MARGIN,
    marginBottom: PACKING_SLIP_BOTTOM_MARGIN,
  },
  topBarGrid: {
    boxSizing: "border-box",
    height: "5rem",
    paddingTop: PACKING_SLIP_TOP_MARGIN,
    marginBottom: "1rem!important",
  },
}));

export const TabNames = {
  Queue: "Queue",
  History: "History",
};

const ReceivingQueue = () => {
  const classes = useStyle();

  //isMounted will be used later to make sure data isn't misrepresented
  // eslint-disable-next-line
  const [isMounted, setIsMounted] = useState(false);

  // Queue Table Data
  const [receivingQueue, setReceivingQueue] = useState([]);
  const [filteredReceivingQueue, setFilteredReceivingQueue] = useState([]);

  const [sortRecQueueModel, setSortRecQueueModel] = useLocalStorage(
    "sortPackQueueModel",
    [
      { field: "orderNumber", sort: "asc" },
      { field: "part", sort: "asc" },
      { field: "batchQty", sort: "asc" },
      { field: "fulfilledQty", sort: "asc" },
    ]
  );

  const [sortRecHistoryModel, setSortRecHistoryModel] = useLocalStorage(
    "sortPackHistoryModel",
    [
      { field: "shipmentId", sort: "asc" },
      { field: "dateCreated", sort: "asc" },
    ]
  );

  // Common tab states
  // eslint-disable-next-line
  const [currentTab, setCurrentTab] = useState(TabNames.Queue);

  const [filteredHist, setFilteredHist] = useState([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [histTotalCount, setHistTotalCount] = useState(0);
  const [histPageNum, setHistPageNum] = useState(0);
  const histResultsPerPage = 10;

  function onTabChange(event, newValue) {
    setCurrentTab(Object.keys(TabNames)[newValue]);
  }

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const fetchSearch = useCallback(
    async (sort, pageNumber, oNum, pNum) => {
      if (isMounted && currentTab === 1) setHistoryLoading(true);
      //TODO call search for receiving hist
      //   await API.searchPackingSlipsHistory(
      //     sort.sortBy,
      //     sort.sortOrder,
      //     oNum,
      //     pNum,
      //     histResultsPerPage,
      //     pageNumber
      //   )
      //     .then((data) => {
      //       if (data) {
      //         if (isMounted) {
      //           let tableData = extractHistoryDetails(data?.packingSlips);
      //           setFilteredHist(tableData);
      //           setHistTotalCount(data?.totalCount);
      //         }
      //       }
      //     })
      //     .finally(() => {
      //       setHistoryLoading(false);
      //     });
    },
    // eslint-disable-next-line
    [histResultsPerPage, isMounted, currentTab]
  );

  async function onHistorySearchClick() {
    setHistPageNum(0);
    await fetchSearch(
      getSortFromModel(sortRecHistoryModel),
      0,
      orderNumber,
      partNumber
    );
  }

  async function onHistoryClearClick() {
    setOrderNumber("");
    setPartNumber("");
    setHistPageNum(0);
    await fetchSearch(getSortFromModel(sortRecHistoryModel), 0, "", "");
  }

  const onHistPageChange = useCallback(
    async (pageNumber) => {
      setHistPageNum(pageNumber);
      //TODO fetch search
      // await fetchSearch(
      //   getSortFromModel(sortPackHistoryModel),
      //   pageNumber,
      //   orderNumber,
      //   partNumber
      // );
    },
    [fetchSearch, sortRecHistoryModel, orderNumber, partNumber]
  );

  return (
    <Box className={classes.box}>
      <Grid
        className={classes.topBarGrid}
        container
        justifyContent="start"
        spacing={2}
      >
        <Grid container item xs={12} spacing={2}>
          {currentTab === TabNames.Queue ? (
            <Grid
              container
              item
              xs={12}
              spacing={2}
              sx={{ marginBottom: "1rem!important" }}
            >
              <Grid container item xs={"auto"}>
                <CommonButton
                  label="Receive Shipment"
                  disabled={true}
                  onClick={undefined}
                />
              </Grid>
              <Grid container item justifyContent="start" xs={6}>
                <Search onSearch={() => {}} autoFocus />
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
        </Grid>

        <Grid item xs={12}>
          <PackShipTabs
            onTabChange={onTabChange}
            queueTotal={receivingQueue?.length}
            queueTab={
              <ReceivingQueueTable
                receivingQueue={receivingQueue}
                tableData={filteredReceivingQueue}
                sortModel={sortRecQueueModel}
                setSortModel={setSortRecQueueModel}
                selectedOrderIds={receivingQueue}
                setSelectedOrderIds={setReceivingQueue}
                setReceivingQueue={setReceivingQueue}
                setFilteredReceivingQueue={setFilteredReceivingQueue}
                searchText={""}
              />
            }
            historyTab={
              <ReceivingHistoryTable
                sortModel={sortRecHistoryModel}
                setSortModel={setSortRecHistoryModel}
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
      </Grid>
    </Box>
  );
};

export default ReceivingQueue;
