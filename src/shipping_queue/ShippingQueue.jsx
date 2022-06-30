import React, { useCallback, useEffect, useState } from "react";
import Search from "../components/Search";
import PackShipTabs from "../components/Tabs";
import { API } from "../services/server";
import { Box, Button, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Link } from "react-router-dom";
import { ROUTE_PACKING_SLIP } from "../router/router";
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
} from "../utils/Constants";

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

export const TabNames = {
  Queue: "Queue",
  History: "History",
};

const ShippingQueue = () => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      { field: "packingSlipId", sort: "asc" },
    ]
  );
  const [queueSearchText, setQueueSearchText] = useState("");

  // Shipping History States
  const [filteredShippingHist, setFilteredShippingHist] = useState([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const histResultsPerPage = 10;
  const [sortShippingHistModel, setSortShippingHistModel] = useLocalStorage(
    "sortShippingHistModel",
    [
      { field: "shipmentId", sort: "asc" },
      { field: "trackingNumber", sort: "asc" },
      { field: "dateCreated", sort: "asc" },
    ]
  );
  const [histTotalCount, setHistTotalCount] = useState(0);

  function onCreateShipmentClick() {
    setCreateShipmentOpen(true);
  }

  function onCreateShipmentClose() {
    setCreateShipmentOpen(false);
    setCurrentDialogState(ShippingDialogStates.CreateShipmentTable);
  }

  function onQueueSearch(value) {
    setQueueSearchText(value);
  }

  function onTabChange(event, newValue) {
    setCurrentTab(Object.keys(TabNames)[newValue]);
  }

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

  useEffect(() => {
    setIsMounted(true);
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
        spacing={2}>
        <Grid container item xs={12} spacing={2}>
          {currentTab === TabNames.Queue ? (
            <Grid
              container
              item
              xs={12}
              spacing={2}
              sx={{ marginBottom: "1rem!important" }}>
              <Grid container item xs={"auto"}>
                <CommonButton
                  label="Create Shipment"
                  disabled={selectedOrderIds.length === 0}
                  onClick={onCreateShipmentClick}
                />
              </Grid>
              <Grid container item justifyContent="start" xs={6}>
                <Search onSearch={onQueueSearch} />
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
            queueTotal={shippingQueue?.length}
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
                searchText={queueSearchText}
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
              />
            }
          />
        </Grid>

        <Grid
          className={classes.bottomBarGrid}
          container
          item
          xs
          justifyContent="flex-end">
          <Button
            component={Link}
            to={ROUTE_PACKING_SLIP}
            variant="contained"
            color="secondary"
            sx={{ marginRight: "0px" }}>
            Go to Packing
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingQueue;
