import React, { useState } from "react";
import PackingDialog from "../components/PackingDialog";
import CreateShipmentTable from "./components/CreateShipmentTable";
import ShippingDialogStates from "./constants/ShippingDialogConstants";
import CreateCarrierShipmentInfoForm from "./components/CreateShipmentInfoForm";
import PickupDropOffForm from "./components/PickupDropOffForm";
import CommonButton from "../common/Button";
import { DialogActions, Grid } from "@mui/material";
import { API } from "../services/server";
import { useEffect } from "react";
import { isShippingInfoValid } from "../utils/Validators";
import { usePackShipSnackbar, snackbarVariants } from "../common/Snackbar";

const CreateShipmentDialog = ({
  customer,
  destination,
  packingSlipIds,
  onClose,
  open,
  currentState,
  setCurrentState,
  parts,
  reloadData,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [shippingInfo, setShippingInfo] = useState({
    manifest: [],
    customer: "",
    deliveryMethod: "",
    checkedCustomer: false,
  });
  const [canErrorCheck, setCanErrorCheck] = useState(false);
  const [reset, setReset] = useState(false);
  const enqueueSnackbar = usePackShipSnackbar();

  useEffect(() => {
    if (
      shippingInfo.customer !== customer?._id ||
      shippingInfo.manifest !== packingSlipIds
    )
      setShippingInfo({
        ...shippingInfo,
        customer: customer?._id,
        manifest: packingSlipIds,
      });
  }, [customer, packingSlipIds, shippingInfo]);

  useEffect(() => {
    setCustomerName("");
    setShippingInfo({
      manifest: packingSlipIds,
      customer: customer?._id,
      deliveryMethod: "",
      checkedCustomer: false,
    });
    setCanErrorCheck(false);
  }, [open, customer?._id, packingSlipIds]);

  const onPickupClick = () => {
    setCurrentState(ShippingDialogStates.PickupDropOffPage);
    setShippingInfo({ ...shippingInfo, deliveryMethod: "PICKUP" });
  };

  const onDropOffClick = () => {
    setCurrentState(ShippingDialogStates.PickupDropOffPage);
    setShippingInfo({ ...shippingInfo, deliveryMethod: "DROPOFF" });
  };

  const onCarrierClick = () => {
    setCurrentState(ShippingDialogStates.CarrierPage);
    setShippingInfo({ ...shippingInfo, deliveryMethod: "CARRIER" });
  };

  const onNextClick = () => {
    setCurrentState(ShippingDialogStates.SelectMethodPage);
  };

  const onResetClick = () => {
    setReset(true);
    setCanErrorCheck(false);
  };

  const onBackClick = () => {
    setCurrentState(ShippingDialogStates.SelectMethodPage);
    setCustomerName("");
    onResetClick();
  };

  const onSubmit = async () => {
    setCanErrorCheck(true);
    if (isShippingInfoValid(shippingInfo)) {
      API.createShipment(
        shippingInfo.manifest,
        shippingInfo.customer,
        shippingInfo.deliveryMethod,
        shippingInfo.trackingNumber,
        shippingInfo.cost,
        shippingInfo.carrier,
        shippingInfo.deliverySpeed,
        shippingInfo.checkedCustomer ? shippingInfo.customerAccount : false,
        customerName
      )
        .then(() => {
          setCustomerName("");
          setShippingInfo({
            manifest: [],
            customer: "",
            deliveryMethod: "",
            checkedCustomer: false,
          });
          reloadData();
          onClose();
          enqueueSnackbar(
            "Shipment created successfully!",
            snackbarVariants.success
          );
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    }
  };

  const renderContents = () => {
    switch (currentState) {
      case ShippingDialogStates.SelectMethodPage:
        break;
      case ShippingDialogStates.CarrierPage:
        return (
          <CreateCarrierShipmentInfoForm
            shippingInfo={shippingInfo}
            setShippingInfo={setShippingInfo}
            canErrorCheck={canErrorCheck}
            reset={reset}
            setReset={setReset}
          />
        );
      case ShippingDialogStates.PickupDropOffPage:
        return (
          <PickupDropOffForm
            customerName={customerName}
            setCustomerName={setCustomerName}
          />
        );
      case ShippingDialogStates.CreateShipmentTable:
      default:
        return (
          <CreateShipmentTable
            rowData={parts.map((e) => {
              return {
                ...e.item,
                id: e.id,
                part: {
                  header: `${e.partNumber} - Rev${e.partRev}`,
                  description: e.partDescription,
                },
                qty: e.qty,
              };
            })}
          />
        );
    }
  };

  const renderDialogActions = () => {
    switch (currentState) {
      case ShippingDialogStates.SelectMethodPage:
        return (
          <DialogActions sx={{ padding: "25px" }}>
            <CommonButton onClick={onPickupClick} label="Pickup" />
            <CommonButton onClick={onDropOffClick} label="Drop Off" />
            <CommonButton onClick={onCarrierClick} label="Carrier" />
          </DialogActions>
        );
      case ShippingDialogStates.CarrierPage:
        return (
          <DialogActions sx={{ justifyContent: "normal" }}>
            <Grid container>
              <Grid item xs>
                <CommonButton onClick={onResetClick} label={"Reset"} />
              </Grid>
              <Grid container item xs justifyContent="flex-end" spacing={1}>
                <Grid item>
                  <CommonButton
                    onClick={onClose}
                    label="Cancel"
                    color="secondary"
                  />
                </Grid>
                <Grid item>
                  <CommonButton
                    autoFocus
                    onClick={onSubmit}
                    label={"OK"}
                    type="button"
                  />
                </Grid>
              </Grid>
            </Grid>
          </DialogActions>
        );
      case ShippingDialogStates.PickupDropOffPage:
        return (
          <DialogActions>
            <CommonButton
              onClick={onBackClick}
              label="Back"
              color="secondary"
            />
            <CommonButton
              autoFocus
              onClick={onSubmit}
              label={"Ok"}
              type="button"
            />
          </DialogActions>
        );
      case ShippingDialogStates.CreateShipmentTable:
      default:
        return (
          <DialogActions>
            <CommonButton onClick={onClose} label="Cancel" color="secondary" />
            <CommonButton autoFocus onClick={onNextClick} label={"Next"} />
          </DialogActions>
        );
    }
  };

  const getDisplayDestination = () => {
    return destination
      ? destination[0]?.toUpperCase() + destination.slice(1)?.toLowerCase()
      : "Unknown";
  };

  return (
    <PackingDialog
      fullWidth={currentState === ShippingDialogStates.CreateShipmentTable}
      titleText={`Create ${getDisplayDestination()} Shipment / ${
        customer?.tag
      }`}
      open={open}
      onClose={onClose}
      actions={renderDialogActions()}
    >
      {renderContents()}
    </PackingDialog>
  );
};

export default CreateShipmentDialog;
