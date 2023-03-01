import React, { useCallback, useEffect, useState } from "react";
import Search from "../components/Search";
import PackShipTabs from "../components/Tabs";
import { API } from "../services/server";
import { Box, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CommonButton from "../common/Button";
import ShippingQueueTable from "./tables/ShippingQueueTable";
import ShippingDialogStates from "../create_shipment/constants/ShippingDialogConstants";
import ShippingHistoryTable from "./tables/ShippingHistoryTable";
import { useLocalStorage } from "../utils/localStorage";
import { extractHistoryDetails } from "./utils/historyDetails";
import { getSortFromModel } from "./utils/sortModelFunctions";
import { OrderPartNumberSearch } from "../components/OrderAndPartSearchBar";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  PACKING_SLIP_RIGHT_MARGIN,
  PACKING_SLIP_LEFT_MARGIN,
  TOP_LEFT_ACTION_BUTTON_WIDTH,
  TOP_LEFT_ACTION_BUTTON_HEIGHT,
} from "../utils/Constants";
import ShippingPendingTable from "./tables/ShippingPendingTable";

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
  Pending: "Pending",
  History: "History",
};

const ShippingQueue = () => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Common tab states
  const [currentTab, setCurrentTab] = useState(TabNames.Queue);

  // Shipping Queue States
  const [shippingQueue, setShippingQueue] = useState([]);
  const [filteredShippingQueue, setFilteredShippingQueue] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [createShipmentOpen, setCreateShipmentOpen] = useState(false);
  const [currentDialogState, setCurrentDialogState] = useState(
    ShippingDialogStates.CreateShipmentTable
  );
  const [sortShippingQueueModel, setSortShippingQueueModel] = useLocalStorage(
    "sortShippingQueueModel",
    [
      { field: "orderNumber", sort: "asc" },
      { field: "label", sort: "asc" },
    ]
  );
  const [searchText, setSearchText] = useState("");

  // Shipping Queue States
  const [pendingShipments, setPendingShipments] = useState([]);
  const [filteredPendingShipments, setFilteredPendingShipments] = useState([]);
  const [selectedPendingOrder, setSelectedPendingOrder] = useState([]);
  const [confirmShipmentOpen, setConfirmShipmentOpen] = useState(false);

  const [sortPendingShipmentModel, setSortPendingShipmentModel] =
    useLocalStorage("sortPendingShipmentModel", [
      { field: "orderNumber", sort: "asc" },
      { field: "label", sort: "asc" },
    ]);

  // Shipping History States
  const [filteredShippingHist, setFilteredShippingHist] = useState([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [histResultsPerPage, setHistResultsPerPage] = useLocalStorage(
    "shippingHistNumRows",
    window.innerHeight > 1440 ? 25 : 10
  );
  const [historyPage, setHistoryPage] = useState(0);

  const [sortShippingHistModel, setSortShippingHistModel] = useLocalStorage(
    "sortShippingHistModel",
    [
      { field: "label", sort: "asc" },
      { field: "trackingNumber", sort: "asc" },
      { field: "dateCreated", sort: "asc" },
    ]
  );
  const [histTotalCount, setHistTotalCount] = useState(0);

  function onCreateShipmentClose() {
    setCreateShipmentOpen(false);
    setCurrentDialogState(ShippingDialogStates.CreateShipmentTable);
  }

  function onConfirmShipmentClose() {
    setConfirmShipmentOpen(false);
    setCurrentDialogState(ShippingDialogStates.CreateShipmentTable);
  }

  function onTabChange(event, newValue) {
    setCurrentTab(Object.keys(TabNames)[newValue]);
    setSearchText("");
  }

  const reloadPendingShipments = useCallback(async () => {
    async function fetchData() {
      const data = await Promise.all([API.getPendingShipments()]);
      return { queue: data[0] };
    }

    if (isMounted) {
      setPendingLoading(true);
      fetchData()
        .then((data) => {
          if (isMounted) {
            // Gather the queue data for the table
            let pendingTableData = [];
            data?.queue?.shipments.forEach((e) => {
              const dc = new Date(e.dateCreated);
              pendingTableData.push({
                id: e._id,
                orderNumber: e.orderNumber,
                customer: e.customer,
                customerHandoffName: e.customerHandoffName,
                trackingNumber: e.trackingNumber,
                dateCreated: dc.toLocaleString(),
                destination: e.destination,
                label: e.label,
                deliveryMethod: e.deliveryMethod,
                items: e.items,
              });
            });

            // The set state order is important
            setSelectedOrderIds([]);
            setPendingShipments(pendingTableData);
            setFilteredPendingShipments(pendingTableData);
          }
        })
        .finally(() => {
          setPendingLoading(false);
        });
    }
    // eslint-disable-next-line
  }, [setFilteredPendingShipments, isMounted]);

  useEffect(() => {
    if (isMounted) reloadPendingShipments();
  }, [reloadPendingShipments, isMounted]);

  const fetchHistorySearch = useCallback(
    async (sort, pageNumber, oNum, pNum) => {
      if (isMounted && currentTab === TabNames.History)
        await API.searchShippingHistory(
          sort.sortBy,
          sort.sortOrder,
          oNum,
          pNum,
          histResultsPerPage,
          pageNumber
        ).then((data) => {
          if (data) {
            if (isMounted) {
              let historyTableData = extractHistoryDetails(data?.shipments);
              setFilteredShippingHist(historyTableData);
              setHistTotalCount(data?.totalCount);
            }
          }
        });
    },
    // eslint-disable-next-line
    [histResultsPerPage, isMounted, currentTab]
  );

  const reloadShipmentHistory = useCallback(async () => {
    if (isMounted) {
      setHistoryLoading(true);
      await Promise.all([
        fetchHistorySearch(
          getSortFromModel(sortShippingHistModel),
          historyPage + 1,
          orderNumber,
          partNumber
        ),
        reloadPendingShipments(),
      ]);
      setHistoryLoading(false);
    }
  }, [
    fetchHistorySearch,
    reloadPendingShipments,
    sortShippingHistModel,
    historyPage,
    orderNumber,
    partNumber,
    isMounted,
  ]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setHistoryLoading(true);
      fetchHistorySearch(
        getSortFromModel(sortShippingHistModel),
        0,
        "",
        ""
      ).finally(() => {
        setHistoryLoading(false);
      });
    }
    // eslint-disable-next-line
  }, [fetchHistorySearch, isMounted]);

  async function onHistorySearchClick() {
    setHistoryLoading(true);
    await fetchHistorySearch(
      getSortFromModel(sortShippingHistModel),
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
    await fetchHistorySearch(
      getSortFromModel(sortShippingHistModel),
      0,
      "",
      ""
    );
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
          {[TabNames.Queue, TabNames.Pending].includes(currentTab) ? (
            <Grid
              container
              item
              xs={12}
              spacing={2}
              sx={{ marginBottom: "1rem!important" }}
            >
              <Grid container item xs={"auto"}>
                {currentTab === TabNames.Queue ? (
                  <CommonButton
                    label="Create Shipment"
                    disabled={selectedOrderIds.length === 0}
                    onClick={() => setCreateShipmentOpen(true)}
                    sx={{
                      minWidth: TOP_LEFT_ACTION_BUTTON_WIDTH,
                      maxHeight: TOP_LEFT_ACTION_BUTTON_HEIGHT,
                    }}
                  />
                ) : (
                  <CommonButton
                    label="Confirm Shipment"
                    disabled={selectedPendingOrder.length === 0}
                    onClick={() => setConfirmShipmentOpen(true)}
                    sx={{
                      minWidth: TOP_LEFT_ACTION_BUTTON_WIDTH,
                      maxHeight: TOP_LEFT_ACTION_BUTTON_HEIGHT,
                    }}
                  />
                )}
              </Grid>
              <Grid container item justifyContent="start" xs={6}>
                <Search
                  onSearch={setSearchText}
                  autoFocus
                  searchString={searchText}
                  setSearchString={setSearchText}
                />
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
            queueTotal={filteredShippingQueue?.length}
            pendingTotal={filteredPendingShipments?.length}
            queueTab={
              <ShippingQueueTable
                shippingQueue={shippingQueue}
                tableData={filteredShippingQueue}
                setSortModel={setSortShippingQueueModel}
                sortModel={sortShippingQueueModel}
                selectedOrderIds={selectedOrderIds}
                setSelectedOrderIds={setSelectedOrderIds}
                onCreateShipmentClose={onCreateShipmentClose}
                setShippingQueue={setShippingQueue}
                setFilteredShippingQueue={setFilteredShippingQueue}
                createShipmentOpen={createShipmentOpen}
                currentDialogState={currentDialogState}
                setCurrentDialogState={setCurrentDialogState}
                searchText={searchText}
                reloadPendingShipments={reloadPendingShipments}
              />
            }
            pendingTab={
              <ShippingPendingTable
                pendingShipments={pendingShipments}
                tableData={filteredPendingShipments}
                setSortModel={setSortPendingShipmentModel}
                sortModel={sortPendingShipmentModel}
                selectedPendingOrder={selectedPendingOrder}
                setSelectedOrderIds={setSelectedPendingOrder}
                onConfirmShipmentClose={onConfirmShipmentClose}
                setPendingShipments={setPendingShipments}
                setFilteredPendingShipments={setFilteredPendingShipments}
                confirmShipmentOpen={confirmShipmentOpen}
                currentDialogState={currentDialogState}
                setCurrentDialogState={setCurrentDialogState}
                searchText={searchText}
                isLoading={pendingLoading}
                reloadData={reloadPendingShipments}
              />
            }
            historyTab={
              <ShippingHistoryTable
                fetchSearch={fetchHistorySearch}
                setSortModel={setSortShippingHistModel}
                sortModel={sortShippingHistModel}
                filteredShippingHist={filteredShippingHist}
                setFilteredShippingHist={setFilteredShippingHist}
                histResultsPerPage={histResultsPerPage}
                histTotalCount={histTotalCount}
                orderNumber={orderNumber}
                partNumber={partNumber}
                historyLoading={historyLoading}
                setHistResultsPerPage={setHistResultsPerPage}
                reloadData={reloadShipmentHistory}
                page={historyPage}
                setPage={setHistoryPage}
              />
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingQueue;
