import React, { useState } from "react";
import PackingDialog from "../components/PackingDialog";
import CreateShipmentTable from "./components/CreateShipmentTable";
import ShippingDialogStates from "./constants/ShippingDialogConstants";
import CreateCarrierShipmentInfoForm from "./components/CreateShipmentInfoForm";
import PickupDropOffForm from "./components/PickupDropOffForm";
import CommonButton from "../common/Button";
import {
  Checkbox,
  DialogActions,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
  TextField,
} from "@mui/material";
import { API } from "../services/server";
import { useEffect } from "react";
import { isShippingInfoValid } from "../utils/Validators";
import { usePackShipSnackbar, snackbarVariants } from "../common/Snackbar";
import ShippingAddressForm from "./components/ShippingAddressForm";
import { DestinationTypes } from "../utils/Constants";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

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
    isDueBack: false,
  });
  const [canErrorCheck, setCanErrorCheck] = useState(false);
  const [reset, setReset] = useState(false);
  const [dateValue, setDate] = useState(null);

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
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    else setCurrentState(ShippingDialogStates.PickupDropOffPage);
    setShippingInfo({ ...shippingInfo, deliveryMethod: "PICKUP" });
  };

  const onDropOffClick = () => {
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    else setCurrentState(ShippingDialogStates.PickupDropOffPage);
    setShippingInfo({ ...shippingInfo, deliveryMethod: "DROPOFF" });
  };

  const onCarrierClick = () => {
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    else setCurrentState(ShippingDialogStates.CarrierPage);
    setShippingInfo({ ...shippingInfo, deliveryMethod: "CARRIER" });
  };

  const onShippingAddressChange = (shippingAddress) => {
    setShippingInfo({
      ...shippingInfo,
      specialShippingAddress: shippingAddress,
    });
  };

  const onShippingAddressNextClick = () => {
    setCurrentState(
      shippingInfo.deliveryMethod === "CARRIER"
        ? ShippingDialogStates.CarrierPage
        : ShippingDialogStates.PickupDropOffPage
    );
  };

  const onNextClick = () => {
    setCurrentState(ShippingDialogStates.SelectMethodPage);
  };

  const onResetClick = () => {
    setReset(true);
    setCanErrorCheck(false);
  };

  const onBackClick = (reset = true) => {
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    else setCurrentState(ShippingDialogStates.SelectMethodPage);
    setCustomerName("");
    if (reset) onResetClick();
  };

  const onBackShippingAddress = () => {
    setCurrentState(ShippingDialogStates.SelectMethodPage);
    setCustomerName("");
    setShippingInfo({
      ...shippingInfo,
      specialShippingAddress: undefined,
    });
    onResetClick();
  };

  const onIsDueBackClick = (checked) => {
    console.log(shippingInfo.isDueBack);
    setShippingInfo({
      ...shippingInfo,
      isDueBack: checked,
    });
    if (!checked) {
      setDate(null);
    }
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
        customerName,
        shippingInfo.specialShippingAddress
      )
        .then((respondeData) => {
          API.createIncomingDelivery(
            "", // TODO internalPurchaseOrderNumber,
            dateValue,
            respondeData.shipment._id
          ).catch((e) => {
            enqueueSnackbar(e.message, snackbarVariants.error);
          });

          setCustomerName("");
          setShippingInfo({
            manifest: [],
            customer: "",
            deliveryMethod: "",
            checkedCustomer: false,
            isDueBack: false,
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
            destination={destination}
          />
        );
      case ShippingDialogStates.PickupDropOffPage:
        return (
          <PickupDropOffForm
            customerName={customerName}
            setCustomerName={setCustomerName}
          />
        );
      case ShippingDialogStates.ShippingAddressPage:
        return (
          <ShippingAddressForm
            shippingAddress={shippingInfo.specialShippingAddress ?? ""}
            setShippingAddress={onShippingAddressChange}
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
                batchNumber: e.item.batch,
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
                    onClick={() => {
                      onBackClick(destination !== DestinationTypes.VENDOR);
                    }}
                    label="Back"
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
              onClick={() => {
                onBackClick(destination !== DestinationTypes.VENDOR);
              }}
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
      case ShippingDialogStates.ShippingAddressPage:
        return (
          <DialogActions>
            <CommonButton
              onClick={onBackShippingAddress}
              label="Back"
              color="secondary"
            />
            <CommonButton
              autoFocus
              onClick={onShippingAddressNextClick}
              label={"Next"}
            />
          </DialogActions>
        );
      case ShippingDialogStates.CreateShipmentTable:
      default:
        return (
          <DialogActions>
            <Grid
              style={{
                paddingLeft: "20px",
                paddingBottom: "20px",
                paddingRight: "20px",
              }}
              container
              item
              direction="row"
              spacing={1}
              justifyContent="space-evenly"
            >
              <Grid
                xs={4}
                container
                item
                direction="row"
                spacing={1}
                justifyContent="left"
              >
                <Grid xs={6} item>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={false}
                          defaultValue={false}
                          onChange={(_, checked) => onIsDueBackClick(checked)}
                        />
                      }
                      label={
                        <Typography style={{ fontWeight: "bold" }}>
                          Is Due Back?
                        </Typography>
                      }
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disabled={!shippingInfo.isDueBack}
                      disablePast={true}
                      label="Due Back Date"
                      value={dateValue}
                      onChange={(newValue) => {
                        setDate(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>

              <Grid
                xs={8}
                container
                item
                direction="row"
                spacing={1}
                justifyContent="right"
              >
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
                    onClick={onNextClick}
                    label={"Next"}
                  />
                </Grid>
              </Grid>
            </Grid>
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
