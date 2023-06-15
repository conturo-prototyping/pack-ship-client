import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import ContextMenu from "../../components/GenericContextMenu";
import MenuItem from "@mui/material/MenuItem";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, TablePagination, Grid } from "@mui/material";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PackShipProgress } from "../../common/CircularProgress";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
  NAV_BAR_HEIGHT,
  PAGINATION_SIZING_OPTIONS,
} from "../../utils/Constants";
import { API } from "../../services/server";
import EditReceiveShipmentDialog from "../../receive_shipment/EditReceivedShipmentDialog";
import { snackbarVariants, usePackShipSnackbar } from "../../common/Snackbar";
import { useLocalStorage } from "../../utils/localStorage";
import { onPageSizeChange } from "../../utils/TablePageSizeHandler";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    minHeight: "20rem",
  },
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const columns = [
  {
    field: "label",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Shipment ID</Typography>;
    },
    flex: 1,
  },
  {
    field: "receivedOn",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Date Received</Typography>;
    },
    flex: 1,
  },
];

const ReceivingHistoryTable = ({
  sortModel,
  setSortModel,
  fetchSearch,
  historyLoading,
  filteredHist,
}) => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [receiveShipmentWindowOpen, setReceiveShipmentWindowOpen] =
    useState(false);

  const [receivedData, setReceivedData] = useState({});

  const [numRowsPerPage, setNumRowsPerPage] = useLocalStorage(
    "receivingHistoryNumRows",
    window.innerHeight > 1440 ? 25 : 10
  );
  const [page, setPage] = useState(0);

  const enqueueSnackbar = usePackShipSnackbar();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reloadData = useCallback(() => {
    if (isMounted) {
      fetchSearch();
    }
    // eslint-disable-next-line
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) reloadData();
  }, [reloadData, isMounted]);

  const historyRowMenuOptions = useMemo(
    () => [
      <MenuItem
        key={"View"}
        onClick={async () => {
          await API.getOneReceivingHistoryElement(selectedRow.id).then(
            (data) => {
              setViewOnly(true);
              setReceivedData({
                ...data.incomingDelivery,
                id: data.incomingDelivery._id,
              });
              setReceiveShipmentWindowOpen(true);
            }
          );
          setContextMenu(null);
        }}>
        View
      </MenuItem>,
      <MenuItem
        key={"Edit"}
        onClick={async () => {
          await API.getOneReceivingHistoryElement(selectedRow.id).then(
            (data) => {
              setViewOnly(false);
              setReceivedData({
                ...data.incomingDelivery,
                id: data.incomingDelivery._id,
              });
              setReceiveShipmentWindowOpen(true);
            }
          );
          setContextMenu(null);
        }}>
        Edit
      </MenuItem>,
      <MenuItem
        key={"Undo Receipt"}
        onClick={async () => {
          await API.undoReciept(selectedRow.id).then(() => {
            enqueueSnackbar("Undid Receipt!", snackbarVariants.success);
            reloadData();
          });
          setContextMenu(null);
        }}>
        Undo Receipt
      </MenuItem>,
    ],
    [selectedRow, enqueueSnackbar, reloadData]
  );

  const onReceiveShipmentSubmit = useCallback(
    (filledForm, id, receivedOn) => {
      const items = filledForm.map((e) => {
        return { ...e, qty: e.qtyReceived };
      });

      API.patchIncomingDelivery(id, {
        ...receivedData,
        receivedOn,
        linesReceived: items,
      })
        .then(() => {
          enqueueSnackbar("Edited delivery!", snackbarVariants.success);
          onReceiveShipmentClose();
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    },
    [enqueueSnackbar, receivedData]
  );

  function onReceiveShipmentClose() {
    setReceiveShipmentWindowOpen(false);
    setViewOnly(false);
  }

  const handleContextMenu = (event) => {
    event.preventDefault();
    const selectedRowId = event.currentTarget.getAttribute("data-id");
    if (selectedRowId) {
      setSelectedRow(filteredHist.filter((e) => e.id === selectedRowId)[0]);
      setContextMenu(
        contextMenu === null
          ? { mouseX: event.clientX, mouseY: event.clientY }
          : null
      );
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const generateTablePagination = useCallback(() => {
    return (
      <table>
        <tbody>
          <tr>
            <TablePagination
              count={filteredHist.length}
              rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
              rowsPerPage={numRowsPerPage}
              onRowsPerPageChange={(event) => {
                const pageValue = parseInt(event.target.value, 10);
                onPageSizeChange(
                  pageValue,
                  page,
                  filteredHist.length,
                  setPage,
                  setNumRowsPerPage
                );
              }}
              onPageChange={handlePageChange}
              page={page}
              sx={{ border: "0px" }}
            />
          </tr>
        </tbody>
      </table>
    );
  }, [
    page,
    filteredHist.length,
    numRowsPerPage,
    setNumRowsPerPage,
    handlePageChange,
  ]);

  return (
    <div className={classes.root}>
      <DataGrid
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - ${NAV_BAR_HEIGHT} - 5rem)`,
          minHeight: "20rem",
        }}
        className={classes.table}
        disableSelectionOnClick={true}
        rows={
          historyLoading
            ? []
            : filteredHist.slice(
                page * numRowsPerPage,
                page * numRowsPerPage + numRowsPerPage
              )
        }
        rowHeight={65}
        columns={columns}
        rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
        checkboxSelection={false}
        editMode="row"
        pageSize={10}
        sortModel={sortModel}
        onSortModelChange={async (model) => {
          setSortModel(model);
        }}
        loading={historyLoading}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
          Footer: () => (
            <Grid
              container
              item
              xs={12}
              justifyContent="flex-end"
              sx={{
                backgroundColor: "primary.light",
                borderTop: "1px solid rgba(224, 224, 224, 1)",
              }}>
              {generateTablePagination()}
            </Grid>
          ),
        }}
        componentsProps={{
          row: {
            onContextMenu: handleContextMenu,
          },
        }}
      />

      <ContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu}>
        {historyRowMenuOptions}
      </ContextMenu>

      <EditReceiveShipmentDialog
        onSubmit={onReceiveShipmentSubmit}
        open={receiveShipmentWindowOpen}
        onClose={onReceiveShipmentClose}
        orderNum={""}
        parts={receivedData}
        title={
          receivedData?.length > 0
            ? `Receive Shipment for ${receivedData[0]["label"]}`
            : ""
        }
        viewOnly={viewOnly}
      />
    </div>
  );
};

export default ReceivingHistoryTable;
