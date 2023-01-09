import React, { useEffect, useState, useCallback, useMemo } from "react";
import PackShipTabs from "../components/Tabs";
import { Box, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Search from "../components/Search";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  PACKING_SLIP_RIGHT_MARGIN,
  PACKING_SLIP_LEFT_MARGIN,
  TOP_LEFT_ACTION_BUTTON_WIDTH,
  TOP_LEFT_ACTION_BUTTON_HEIGHT,
} from "../utils/Constants";
import ReceivingQueueTable from "./tables/ReceivingQueueTable";
import { useLocalStorage } from "../utils/localStorage";
import CommonButton from "../common/Button";
import ReceivingHistoryTable from "./tables/ReceivingHistoryTable";
import ReceiveShipmentDialog from "../receive_shipment/ReceiveShipmentDialog";
import { snackbarVariants, usePackShipSnackbar } from "../common/Snackbar";
import { API } from "../services/server";
import CancelReceiveShipmentDialog from "../receive_shipment/CancelReceiveShipmentDialog";

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

  const [searchString, setSearchString] = useState("");

  //isMounted will be used later to make sure data isn't misrepresented
  // eslint-disable-next-line
  const [isMounted, setIsMounted] = useState(false);
  const enqueueSnackbar = usePackShipSnackbar();

  // Queue Table Data
  const [receivingQueue, setReceivingQueue] = useState([]);
  const [filteredReceivingQueue, setFilteredReceivingQueue] = useState([]);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState([]);

  // Receive Shipment Window Data
  const [receiveShipmentWindowOpen, setReceiveShipmentWindowOpen] =
    useState(false);

  // Cancel Window
  const [cancelShipmentOpen, setCancelShipmentOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelError, setIsCancelError] = useState(false);

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
      { field: "label", sort: "asc" },
      { field: "receivedOn", sort: "asc" },
    ]
  );

  // Common tab states
  // eslint-disable-next-line
  const [currentTab, setCurrentTab] = useState(TabNames.Queue);

  const [filteredHist, setFilteredHist] = useState([]);
  const [allHist, setAllHist] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const histResultsPerPage = 10;
  function onReceiveShipmentClose() {
    setReceiveShipmentWindowOpen(false);
  }

  const onReceiveShipmentSubmit = useCallback(
    (filledForm, id) => {
      const items = filledForm.map((e) => {
        return { poLineId: e.lineId, qtyReceived: e.qtyReceived };
      });

      API.submitIncomingDelivery(
        id,
        filledForm[0].poType,
        filledForm[0].poId,
        items
      )
        .then(() => {
          enqueueSnackbar(
            "Received incoming delivery!",
            snackbarVariants.success
          );
          onReceiveShipmentClose();
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    },
    [enqueueSnackbar]
  );

  function onTabChange(event, newValue) {
    setCurrentTab(Object.keys(TabNames)[newValue]);
  }

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const fetchReceivingHistory = useCallback(
    async () => {
      if (isMounted && currentTab === 1) setHistoryLoading(true);
      await API.getReceivingHistory()
        .then((data) => {
          if (data && isMounted) {
            const history = data?.receivedDeliveries.map((e) => {
              return {
                id: e._id,
                label: e.label,
                receivedOn: new Date(e.receivedOn).toLocaleString(),
              };
            });
            setFilteredHist(history);
            setAllHist(history);
          }
        })
        .finally(() => {
          setHistoryLoading(false);
        });
    },
    // eslint-disable-next-line
    [histResultsPerPage, isMounted, currentTab]
  );

  const selectedReceiveShipment = useMemo(
    () =>
      filteredReceivingQueue?.filter((e) => selectedShipmentIds[0] === e.id),
    [filteredReceivingQueue, selectedShipmentIds]
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
              <Grid container item xs={10} spacing={2}>
                <Grid container item xs={"auto"}>
                  <CommonButton
                    label="Receive Shipment"
                    disabled={selectedShipmentIds.length === 0}
                    onClick={() => {
                      setTimeout(
                        () => setReceiveShipmentWindowOpen((prev) => !prev),
                        0
                      );
                    }}
                    sx={{
                      minWidth: TOP_LEFT_ACTION_BUTTON_WIDTH,
                      maxHeight: TOP_LEFT_ACTION_BUTTON_HEIGHT,
                    }}
                  />
                </Grid>
                <Grid container item justifyContent="start" xs={4}>
                  <Search
                    onSearch={(e) => {
                      setSearchString(e);
                    }}
                    autoFocus
                    searchString={searchString}
                    setSearchString={setSearchString}
                  />
                </Grid>
              </Grid>
              <Grid container item xs={2} justifyContent="end">
                <CommonButton
                  label="Cancel"
                  disabled={selectedShipmentIds.length === 0}
                  onClick={() => {
                    setCancelShipmentOpen((prev) => !prev);
                  }}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              item
              justifyContent="start"
              xs={6}
              sx={{ marginBottom: "1rem!important" }}
            >
              <Search
                onSearch={async (e) => {
                  if (e) {
                    setFilteredHist(
                      allHist.filter((data) =>
                        data.label.toLowerCase().includes(e.toLowerCase())
                      )
                    );
                  } else {
                    await fetchReceivingHistory();
                  }
                }}
                autoFocus
              />
            </Grid>
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
                selectedShipmentIds={selectedShipmentIds}
                setSelectedShipmentIds={setSelectedShipmentIds}
                setReceivingQueue={setReceivingQueue}
                setFilteredReceivingQueue={setFilteredReceivingQueue}
                searchText={searchString}
              />
            }
            historyTab={
              <ReceivingHistoryTable
                sortModel={sortRecHistoryModel}
                setSortModel={setSortRecHistoryModel}
                fetchSearch={fetchReceivingHistory}
                historyLoading={historyLoading}
                filteredHist={filteredHist}
              />
            }
          />
        </Grid>
      </Grid>
      <CancelReceiveShipmentDialog
        canErrorCheck={true}
        isError={isCancelError}
        open={cancelShipmentOpen}
        onClose={() => {
          setCancelReason("");
          setCancelShipmentOpen(false);
          setIsCancelError(false);
        }}
        onChange={(v) => {
          setCancelReason(v);
          if (!v) {
            setIsCancelError(true);
          } else {
            setIsCancelError(false);
          }
        }}
        onSubmit={() => {
          if (!cancelReason) {
            setIsCancelError(true);
          } else {
            API.cancelIncomingDelivery(
              selectedReceiveShipment[0]?.id,
              cancelReason
            )
              .then((data) => {
                enqueueSnackbar(
                  "Incoming shipment has been canceled",
                  snackbarVariants.success
                );
              })
              .catch((e) => {
                enqueueSnackbar(e.message, snackbarVariants.error);
              })
              .finally(() => {
                setCancelReason("");
                setCancelShipmentOpen(false);
                setIsCancelError(false);
              });
          }
        }}
        reason={cancelReason}
      />
      <ReceiveShipmentDialog
        onSubmit={onReceiveShipmentSubmit}
        open={receiveShipmentWindowOpen}
        onClose={onReceiveShipmentClose}
        orderNum={""}
        parts={selectedReceiveShipment}
        title={
          selectedReceiveShipment?.length > 0
            ? `Receive Shipment for ${selectedReceiveShipment[0]["label"]}`
            : ""
        }
        viewOnly={false}
      />
    </Box>
  );
};

export default ReceivingQueue;
