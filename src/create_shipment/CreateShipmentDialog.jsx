import React, { useState } from "react";
import PackingDialog from "../components/PackingDialog";
import CreateShipmentTable from "./components/CreateShipmentTable";
import ShippingDialogStates from "./constants/ShippingDialogConstants";
import CreateCarrierShipmentInfoForm from "./components/CreateShipmentInfoForm";
import CommonButton from "../common/Button";
import {
  Checkbox,
  DialogActions,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from "@mui/material";
import { API } from "../services/server";
import { useEffect } from "react";
import { isShippingInfoValid } from "../utils/Validators";
import { usePackShipSnackbar, snackbarVariants } from "../common/Snackbar";
import ShippingAddressForm from "./components/ShippingAddressForm";
import { DestinationTypes } from "../utils/Constants";
import PackShipDatePicker from "../components/PackShipDatePicker";

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
    isDueBackOn: null,
    carrier: "",
  });
  const [canErrorCheck, setCanErrorCheck] = useState(false);
  const [reset, setReset] = useState(false);
  const [displayDateHelper, setDisplayDateHelper] = useState(false);

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
      isDueBack: false,
      isDueBackOn: null,
    });
    setCanErrorCheck(false);
  }, [open, customer?._id, packingSlipIds]);

  const onPickupClick = () => {
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    setShippingInfo({
      ...shippingInfo,
      deliveryMethod: "PICKUP",
      checkedCustomer: undefined,
      customerAccount: undefined,
    });
  };

  const onDropOffClick = () => {
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    setShippingInfo({
      ...shippingInfo,
      deliveryMethod: "DROPOFF",
      checkedCustomer: undefined,
      customerAccount: undefined,
    });
  };

  const onCarrierClick = () => {
    if (destination !== DestinationTypes.CUSTOMER) {
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    } else {
      setCurrentState(ShippingDialogStates.CarrierPage);
    }

    setShippingInfo({
      ...shippingInfo,
      deliveryMethod: "CARRIER",
      checkedCustomer: customer.defaultCarrierAccount !== undefined,
      customerAccount: customer.defaultCarrierAccount ?? "",
      carrier: customer.defaultCarrier ?? "",
    });
  };

  const onShippingAddressChange = (shippingAddress) => {
    setShippingInfo({
      ...shippingInfo,
      specialShippingAddress: shippingAddress,
    });
  };

  const onShippingAddressNextClick = () => {
    if (shippingInfo.deliveryMethod === "CARRIER")
      setCurrentState(ShippingDialogStates.CarrierPage);
  };

  const onNextClick = () => {
    if (shippingInfo.isDueBack && !shippingInfo.isDueBackOn?.isValid()) {
      setDisplayDateHelper(true);
    } else {
      setCurrentState(ShippingDialogStates.SelectMethodPage);
      setDisplayDateHelper(false);
    }
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
    setDisplayDateHelper(false);
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
    if (checked) {
      setShippingInfo({
        ...shippingInfo,
        isDueBack: checked,
      });
    } else {
      setShippingInfo({
        ...shippingInfo,
        isDueBack: checked,
        isDueBackOn: null,
      });
      setDisplayDateHelper(false);
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
        shippingInfo.specialShippingAddress,
        shippingInfo.isDueBack,
        shippingInfo.isDueBackOn
      )
        .then(() => {
          setCustomerName("");
          setDisplayDateHelper(false);
          setShippingInfo({
            manifest: [],
            customer: "",
            deliveryMethod: "",
            checkedCustomer: false,
            isDueBack: false,
            isDueBackOn: null,
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
      case ShippingDialogStates.ShippingAddressPage:
        return (
          <DialogActions>
            <CommonButton
              onClick={onBackShippingAddress}
              label="Back"
              color="secondary"
            />
            {shippingInfo.deliveryMethod === "CARRIER" ? (
              <CommonButton
                autoFocus
                onClick={onShippingAddressNextClick}
                label={"Next"}
                type="button"
              />
            ) : (
              <CommonButton
                autoFocus
                onClick={onSubmit}
                label={"Ok"}
                type="button"
              />
            )}
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
                          value={shippingInfo.isDueBack}
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
                  <PackShipDatePicker
                    disabled={!shippingInfo.isDueBack}
                    value={shippingInfo.isDueBackOn}
                    disablePast={true}
                    label="Due Back Date"
                    onChange={(newValue) => {
                      setShippingInfo({
                        ...shippingInfo,
                        isDueBackOn: newValue,
                      });
                      setDisplayDateHelper(!newValue?.isValid());
                    }}
                    displayDateHelper={displayDateHelper}
                  />
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
                    onClick={() => {
                      onClose();
                      setDisplayDateHelper(false);
                    }}
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
