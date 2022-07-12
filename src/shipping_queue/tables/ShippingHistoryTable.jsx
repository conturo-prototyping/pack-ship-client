import React, { useCallback, useState, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, MenuItem } from "@mui/material";
import { styled } from "@mui/system";
import ContextMenu from "../../components/GenericContextMenu";
import EditShipmentTableDialog from "../EditShipmentDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import { isShippingInfoValid } from "../../utils/Validators";
import { API } from "../../services/server";
import { getSortFromModel } from "../utils/sortModelFunctions";
import { PackShipProgress } from "../../common/CircularProgress";
import { snackbarVariants, usePackShipSnackbar } from "../../common/Snackbar";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
} from "../../utils/Constants";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  fulfilledQtyHeader: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  help: {
    paddingLeft: "10px",
  },
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const ThisDataGrid = styled(DataGrid)`
  .MuiDataGrid-row {
    max-height: fit-content !important;
  }

  .MuiDataGrid-renderingZone {
    max-height: none !important;
  }

  .MuiDataGrid-cell {
    max-height: fit-content !important;
    overflow: auto;
    height: auto;
    line-height: none !important;
    align-items: center;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
`;

const ShippingHistoryTable = ({
  sortModel,
  setSortModel,
  fetchSearch,
  filteredShippingHist,
  setFilteredShippingHist,
  histResultsPerPage,
  histTotalCount,
  orderNumber,
  partNumber,
  historyLoading,
}) => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [historyMenuPosition, setHistoryMenuPosition] = useState(null);
  const [clickedHistShipment, setClickedHistShipment] = useState();

  // Edit Shipment Dialog
  const [isEditShipmentOpen, setIsEditShipmentOpen] = useState(false);
  const [isEditShipmentViewOnly, setIsEditShipmentViewOnly] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [confirmShippingDeleteDialogOpen, setConfirmShippingDeleteDialogOpen] =
    useState(false);
  const [packingSlipToDelete, setPackingSlipToDelete] = useState();
  const [canErrorCheck, setCanErrorCheck] = useState(false);
  const [page, setPage] = useState(0);

  const enqueueSnackbar = usePackShipSnackbar();
  const [deletedPackingSlips, setDeletedPackingSlips] = useState([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onHistoryRowClick = useCallback((params, event, __) => {
    API.getShipment(params.id).then((data) => {
      if (data) {
        setClickedHistShipment(data.shipment);
      }
    });

    setHistoryMenuPosition({ left: event.pageX, top: event.pageY });
  }, []);

  const onEditShipmentClose = useCallback(() => {
    // close context menu
    setHistoryMenuPosition(null);
    // close edit dialog
    setIsEditShipmentOpen(false);
    // reset whether to check form for errors
    setCanErrorCheck(false);
  }, []);

  const reloadData = useCallback(async () => {
    if (isMounted) {
      setIsLoading(true);
      await fetchSearch(
        getSortFromModel(sortModel),
        page + 1,
        orderNumber,
        partNumber
      );
      setIsLoading(false);
    }
  }, [fetchSearch, sortModel, page, orderNumber, partNumber, isMounted]);

  const onEditShipmentSubmit = useCallback(() => {
    setCanErrorCheck(true);

    if (isShippingInfoValid(clickedHistShipment)) {
      let sentData = {
        ...clickedHistShipment,
        deletedPackingSlips,
      };

      sentData.newPackingSlips = clickedHistShipment.manifest
        .filter((e) => e?.isNew === true)
        .map((e) => e._id);

      API.patchShipment(sentData?._id, sentData)
        .then(async () => {
          setIsEditShipmentOpen(false);

          // Update the shippingHistory tracking # for main table as well
          setFilteredShippingHist(
            filteredShippingHist.map((obj) => {
              if (obj.id === clickedHistShipment?._id) {
                return {
                  ...obj,
                  trackingNumber: clickedHistShipment?.trackingNumber,
                };
              } else {
                return obj;
              }
            })
          );
          await reloadData();

          //close context menu
          setHistoryMenuPosition(null);

          setCanErrorCheck(false);
          enqueueSnackbar(
            "Shipment edited successfully!",
            snackbarVariants.success
          );

          setDeletedPackingSlips([]);
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    }
  }, [
    clickedHistShipment,
    filteredShippingHist,
    setFilteredShippingHist,
    reloadData,
    enqueueSnackbar,
    deletedPackingSlips,
  ]);

  const onHistoryPackingSlipAdd = useCallback(
    (pageNum) => {
      API.searchPackingSlips(clickedHistShipment?.customer?._id, null).then(
        (data) => {
          let updatedShipment = { ...clickedHistShipment };
          const possibleChoices = data?.packingSlips.filter(
            (e) => !clickedHistShipment.manifest.some((m) => m._id === e._id)
          );
          if (data?.packingSlips.length > 0 && possibleChoices.length > 0) {
            updatedShipment.manifest = updatedShipment.manifest.map((e) => {
              if (e.isNew) {
                const newPossibleChoices = e.possibleSlips.filter(
                  (t) => t._id !== possibleChoices[0]._id
                );
                return {
                  ...e,
                  possibleSlips: newPossibleChoices,
                };
              }
              return e;
            });

            updatedShipment.manifest.push({
              _id: "",
              pageNum: pageNum,
              isNew: true,
              customer: clickedHistShipment.customer._id,
              possibleSlips: possibleChoices,
              ...possibleChoices[0],
            });

            setClickedHistShipment(updatedShipment);
          } else {
            alert("There are no additions that can be made.");
          }
        }
      );
    },
    [clickedHistShipment]
  );

  const onNewRowChange = useCallback(
    (oldVal, newVal) => {
      const manifestIndex = clickedHistShipment?.manifest?.findIndex(
        (e) => e._id === oldVal._id
      );
      let updatedShipment = {
        ...clickedHistShipment,
      };

      updatedShipment.manifest[manifestIndex] = {
        ...oldVal,
        ...newVal,
      };
      API.searchPackingSlips(updatedShipment?.customer?._id, null).then(
        (data) => {
          updatedShipment.manifest = updatedShipment.manifest.map((e) => {
            if (e.isNew) {
              const possibleChoices = data?.packingSlips.filter(
                (t) =>
                  !updatedShipment.manifest.some(
                    (m) => m._id === t._id && t._id !== e._id
                  )
              );
              return {
                ...e,
                possibleSlips: possibleChoices,
              };
            }
            return e;
          });
          setClickedHistShipment(updatedShipment);
        }
      );
    },
    [clickedHistShipment]
  );

  const onHistoryPackingSlipDelete = useCallback(() => {
    if (packingSlipToDelete) {
      // remove packing slip id from shipment
      const newShipmentManifest = clickedHistShipment?.manifest?.filter(
        (e) => e._id !== packingSlipToDelete.id
      );

      setClickedHistShipment({
        ...clickedHistShipment,
        manifest: newShipmentManifest,
      });

      setDeletedPackingSlips((prevState) => [
        ...prevState,
        packingSlipToDelete.id,
      ]);
    }
  }, [clickedHistShipment, packingSlipToDelete]);

  const onPageChange = useCallback(
    async (pageNumber) => {
      setPage(pageNumber);
      setIsLoading(true);
      await fetchSearch(
        getSortFromModel(sortModel),
        pageNumber + 1,
        orderNumber,
        partNumber
      );
      setIsLoading(false);
    },
    [fetchSearch, sortModel, orderNumber, partNumber]
  );

  const columns = [
    {
      field: "shipmentId",
      flex: 1,
      sortingOrder: ["desc", "asc"],
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Shipment ID</Typography>;
      },
    },
    {
      field: "trackingNumber",
      flex: 2,
      sortable: false,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Tracking #</Typography>;
      },
    },
    {
      field: "dateCreated",
      flex: 1,
      sortingOrder: ["desc", "asc"],
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Date Created</Typography>;
      },
    },
  ];

  const historyRowMenuOptions = [
    <MenuItem
      key="view-menu-item"
      onClick={() => {
        setIsEditShipmentOpen(true);
        setIsEditShipmentViewOnly(true);
      }}
    >
      View
    </MenuItem>,
    // <MenuItem key="download-menu-item">Download</MenuItem>,
    <MenuItem
      key="edit-menu-item"
      onClick={() => {
        setIsEditShipmentOpen(true);
        setIsEditShipmentViewOnly(false);
      }}
    >
      Edit
    </MenuItem>,
    <MenuItem
      key="delete-menu-item"
      onClick={() => {
        setHistoryMenuPosition(null);
        setConfirmShippingDeleteDialogOpen(true);
      }}
    >
      Delete
    </MenuItem>,
  ];

  return (
    <div className={classes.root}>
      <ThisDataGrid
        paginationMode="server"
        onPageChange={onPageChange}
        rowCount={histTotalCount}
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - 15rem)`,
          minHeight: "20rem",
        }}
        className={classes.table}
        disableSelectionOnClick={true}
        rows={isLoading || historyLoading ? [] : filteredShippingHist}
        rowHeight={65}
        columns={columns}
        pageSize={histResultsPerPage}
        rowsPerPageOptions={[10]}
        checkboxSelection={false}
        editMode="row"
        sortingMode="server"
        onRowClick={onHistoryRowClick}
        sortModel={sortModel}
        onSortModelChange={async (model) => {
          setSortModel(model);
          setIsLoading(true);
          await fetchSearch(
            getSortFromModel(model),
            page + 1,
            orderNumber,
            partNumber
          );
          setIsLoading(false);
        }}
        loading={isLoading || historyLoading}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
        }}
      />

      <ContextMenu
        menuPosition={historyMenuPosition}
        setMenuPosition={setHistoryMenuPosition}
      >
        {historyRowMenuOptions}
      </ContextMenu>

      <EditShipmentTableDialog
        canErrorCheck={canErrorCheck}
        shipment={clickedHistShipment}
        isOpen={isEditShipmentOpen}
        onClose={onEditShipmentClose}
        onSubmit={onEditShipmentSubmit}
        viewOnly={isEditShipmentViewOnly}
        onDelete={(params) => {
          setConfirmDeleteDialogOpen(true);
          setPackingSlipToDelete(params.row);
        }}
        onAdd={onHistoryPackingSlipAdd}
        onCostChange={(value) => {
          setClickedHistShipment({ ...clickedHistShipment, cost: value });
        }}
        onCarrierInputChange={(value) => {
          setClickedHistShipment({
            ...clickedHistShipment,
            carrier: value,
          });
        }}
        onDeliverySpeedChange={(value) => {
          setClickedHistShipment({
            ...clickedHistShipment,
            deliverySpeed: value,
          });
        }}
        onCustomerAccountChange={(value) => {
          setClickedHistShipment({
            ...clickedHistShipment,
            customerAccount: value,
          });
        }}
        onCustomerNameChange={(value) => {
          setClickedHistShipment({
            ...clickedHistShipment,
            customerHandoffName: value,
          });
        }}
        onTrackingChange={(value) => {
          setClickedHistShipment({
            ...clickedHistShipment,
            trackingNumber: value,
          });
        }}
        onNewRowChange={onNewRowChange}
      />

      <ConfirmDialog
        title="Are You Sure You Want To Delete This?"
        open={confirmDeleteDialogOpen}
        setOpen={setConfirmDeleteDialogOpen}
        onConfirm={onHistoryPackingSlipDelete}
      />

      <ConfirmDialog
        title={`Are You Sure You Want To Delete`}
        open={confirmShippingDeleteDialogOpen}
        setOpen={setConfirmShippingDeleteDialogOpen}
        onConfirm={() => {
          API.deleteShipment(clickedHistShipment._id)
            .then(() => {
              reloadData();
              enqueueSnackbar(
                "Shipment deleted successfully!",
                snackbarVariants.success
              );
            })
            .catch((e) => {
              enqueueSnackbar(e.mesage, snackbarVariants.error);
            });
        }}
      >
        <Typography sx={{ fontWeight: 900 }}>
          {clickedHistShipment?.shipmentId}
        </Typography>
      </ConfirmDialog>
    </div>
  );
};

export default ShippingHistoryTable;
