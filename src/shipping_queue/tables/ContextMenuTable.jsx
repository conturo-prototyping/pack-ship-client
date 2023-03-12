import React, { useCallback, useState } from "react";
import { Typography } from "@mui/material";
import EditShipmentTableDialog from "../EditShipmentDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import { isShippingInfoValid } from "../../utils/Validators";
import { API } from "../../services/server";
import { snackbarVariants, usePackShipSnackbar } from "../../common/Snackbar";
import pdfMake from "pdfmake/build/pdfmake";
import ShippingContextMenu from "../ShippingContextMenu";

const ContextMenuTable = (OriginalTable, cantEditShippingDetails) => {
  function NewComponent(props) {
    const { reloadData } = props;
    const [contextMenu, setContextMenu] = useState(null);
    const [clickedHistShipment, setClickedHistShipment] = useState();

    // Edit Shipment Dialog
    const [isEditShipmentOpen, setIsEditShipmentOpen] = useState(false);
    const [isEditShipmentViewOnly, setIsEditShipmentViewOnly] = useState(false);
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
      useState(false);

    const [
      confirmShippingDeleteDialogOpen,
      setConfirmShippingDeleteDialogOpen,
    ] = useState(false);

    const [packingSlipToDelete, setPackingSlipToDelete] = useState();
    const [canErrorCheck, setCanErrorCheck] = useState(false);

    const enqueueSnackbar = usePackShipSnackbar();
    const [deletedPackingSlips, setDeletedPackingSlips] = useState([]);

    const handleContextMenu = (event) => {
      event.preventDefault();
      const selectedRowId = event.currentTarget.getAttribute("data-id");
      if (selectedRowId) {
        setContextMenu(
          contextMenu === null
            ? { mouseX: event.clientX, mouseY: event.clientY }
            : null
        );
        API.getShipment(selectedRowId).then((data) => {
          if (data) {
            setClickedHistShipment(data.shipment);
          }
        });
      }
    };

    const onEditShipmentClose = useCallback(() => {
      // close context menu
      setContextMenu(null);
      // close edit dialog
      setIsEditShipmentOpen(false);
      // reset whether to check form for errors
      setCanErrorCheck(false);
    }, []);

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
            await reloadData();

            //close context menu
            setContextMenu(null);

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
    }, [clickedHistShipment, reloadData, enqueueSnackbar, deletedPackingSlips]);

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

    const createShipmentPdfDoc = useCallback(async () => {
      await API.downloadShipmentPDF(clickedHistShipment)
        .then((data) => {
          pdfMake.createPdf(data.docDefinition).open();
          enqueueSnackbar(
            "Shipment paperwork downloaded",
            snackbarVariants.success
          );
          return data;
        })
        .catch((e) => {
          console.error(e);
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    }, [clickedHistShipment, enqueueSnackbar]);

    return (
      <div>
        <OriginalTable
          reloadData={reloadData}
          handleContextMenu={handleContextMenu}
          {...props}
        />

        <ShippingContextMenu
          setIsEditShipmentOpen={setIsEditShipmentOpen}
          setIsEditShipmentViewOnly={setIsEditShipmentViewOnly}
          createShipmentPdfDoc={createShipmentPdfDoc}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          setConfirmShippingDeleteDialogOpen={
            setConfirmShippingDeleteDialogOpen
          }
        />

        <EditShipmentTableDialog
          canErrorCheck={canErrorCheck}
          shipment={clickedHistShipment}
          isOpen={isEditShipmentOpen}
          onClose={onEditShipmentClose}
          onSubmit={onEditShipmentSubmit}
          viewOnly={isEditShipmentViewOnly}
          cantEditShippingDetails={cantEditShippingDetails}
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
          onShippingAddressChange={(value) => {
            setClickedHistShipment({
              ...clickedHistShipment,
              specialShippingAddress: value,
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
              .then(async () => {
                await reloadData();
                enqueueSnackbar(
                  "Shipment deleted successfully!",
                  snackbarVariants.success
                );
              })
              .catch((e) => {
                enqueueSnackbar(e.message, snackbarVariants.error);
              });
          }}
        >
          <Typography sx={{ fontWeight: 900 }}>
            {clickedHistShipment?.label}
          </Typography>
        </ConfirmDialog>
      </div>
    );
  }
  return NewComponent;
};

export default ContextMenuTable;
