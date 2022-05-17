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
import TextInput from "../components/TextInput";
import { useLocalStorage } from "../utils/localStorage";
import { extractHistoryDetails } from "./utils/historyDetails";
import { getSortFromModel } from "./utils/sortModelFunctions";

const useStyle = makeStyles((theme) => ({
  topBarGrid: {
    paddingBottom: "20px",
  },
  navButton: {
    paddingTop: "20px",
  },
}));

export const TabNames = {
  Queue: "Queue",
  History: "History",
};

const ShippingQueue = () => {
  const classes = useStyle();

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

  const fetchSearch = useCallback(
    (sort, pageNumber, oNum, pNum) => {
      API.searchShippingHistory(
        sort.sortBy,
        sort.sortOrder,
        oNum,
        pNum,
        histResultsPerPage,
        pageNumber
      ).then((data) => {
        if (data) {
          let historyTableData = extractHistoryDetails(data?.data?.shipments);
          setFilteredShippingHist(historyTableData);
          setHistTotalCount(data?.data?.totalCount);
        }
      });
    },
    [histResultsPerPage]
  );

  useEffect(() => {
    fetchSearch(
      getSortFromModel(sortShippingHistModel),
      0,
      "",
      ""
    );
    // eslint-disable-next-line
  }, [fetchSearch]);

  function onHistorySearchClick() {
    fetchSearch(
      getSortFromModel(sortShippingHistModel),
      0,
      orderNumber,
      partNumber
    );
  }

  function onHistoryClearClick() {
    setOrderNumber("");
    setPartNumber("");
    fetchSearch(getSortFromModel(sortShippingHistModel), 0, "", "");
  }

  return (
    <Box p="40px">
      {currentTab === TabNames.Queue ? (
        <Grid
          className={classes.topBarGrid}
          container
          justifyContent="start"
          spacing={2}
        >
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
        <Grid
          className={classes.topBarGrid}
          container
          justifyContent="start"
          spacing={2}
        >
          <Grid container item xs={"auto"}>
            <TextInput
              onChange={(e) => {
                if (
                  (e === "" || e === undefined || e === null) &&
                  (partNumber === "" ||
                    partNumber === undefined ||
                    partNumber === null)
                ) {
                  onHistoryClearClick();
                }
                setOrderNumber(e);
              }}
              placeholder="Order"
              value={orderNumber}
            />
          </Grid>
          <Grid container item xs={2}>
            <TextInput
              onChange={(e) => {
                if (
                  (e === "" || e === undefined || e === null) &&
                  (orderNumber === "" ||
                    orderNumber === undefined ||
                    orderNumber === null)
                ) {
                  onHistoryClearClick();
                }
                setPartNumber(e);
              }}
              placeholder="Part"
              value={partNumber}
            />
          </Grid>
          <Grid container item xs={2}>
            <CommonButton
              label="Clear"
              onClick={onHistoryClearClick}
              disabled={!orderNumber && !partNumber}
            />
          </Grid>
          <Grid container item xs justifyContent="flex-end">
            <CommonButton
              label="Search"
              onClick={onHistorySearchClick}
              disabled={!orderNumber && !partNumber}
            />
          </Grid>
        </Grid>
      )}

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
            fetchSearch={fetchSearch}
            setSortModel={setSortShippingHistModel}
            sortModel={sortShippingHistModel}
            filteredShippingHist={filteredShippingHist}
            setFilteredShippingHist={setFilteredShippingHist}
            histResultsPerPage={histResultsPerPage}
            histTotalCount={histTotalCount}
            orderNumber={orderNumber}
            partNumber={partNumber}
          />
        }
      />

      <Grid
        className={classes.navButton}
        container
        item
        xs
        justifyContent="flex-end"
      >
        <Button component={Link} to={ROUTE_PACKING_SLIP} variant="contained">
          Packing
        </Button>
      </Grid>
    </Box>
  );
};

export default ShippingQueue;
