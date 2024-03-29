import React, { useEffect, useMemo, useState } from "react";
import {
  TextField,
  Grid,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material";
import CarrierServiceDropdown from "../../components/CarrierServiceDropdown";
import { CARRIERS } from "../../utils/Constants";
import CheckboxForm from "../../components/CheckboxForm";
import { DestinationTypes } from "../../utils/Constants";

const CreateCarrierShipmentInfoForm = ({
  shippingInfo,
  setShippingInfo,
  canErrorCheck,
  reset,
  setReset,
  destination,
  disablePendingFields,
}) => {
  const [localShippingInfo, setLocalShippingInfo] = useState({
    carrier: CARRIERS[0],
    ...shippingInfo,
  });

  const defaultInfo = useMemo(() => {
    return {
      manifest: shippingInfo.manifest || shippingInfo.items,
      customer: shippingInfo.customer,
      deliveryMethod: shippingInfo.deliveryMethod,
      // carrier: CARRIERS[0],
      carrier: shippingInfo.carrier,
      checkedCustomer: shippingInfo.checkedCustomer,
      customerAccount: shippingInfo.customerAccount,
    };
  }, [
    shippingInfo.manifest,
    shippingInfo.items,
    shippingInfo.customer,
    shippingInfo.deliveryMethod,
    shippingInfo.checkedCustomer,
    shippingInfo.customerAccount,
    shippingInfo.carrier,
  ]);

  useEffect(() => {
    if (reset) {
      setShippingInfo(defaultInfo);
      setLocalShippingInfo(defaultInfo);
      setReset(false);
    }
  }, [reset, setReset, defaultInfo, setShippingInfo]);

  return (
    <Box component="form" sx={{ minWidth: "30rem" }}>
      <Grid container item alignItems="center" spacing={2}>
        <Grid container item xs={5} justifyContent="flex-end">
          <Typography align="right" sx={{ fontWeight: 700 }}>
            Carrier Service*:
          </Typography>
        </Grid>
        <Grid item xs>
          <CarrierServiceDropdown
            carrier={localShippingInfo?.carrier}
            setCarrier={(value) => {
              setShippingInfo({
                ...localShippingInfo,
                carrier: value,
              });
              setLocalShippingInfo({
                ...localShippingInfo,
                carrier: value,
              });
            }}
            canErrorCheck={canErrorCheck}
            width="75%"
          />
        </Grid>
      </Grid>
      <Grid container item alignItems="center" spacing={2}>
        <Grid container item xs={5} justifyContent="flex-end">
          <Typography align="right" sx={{ fontWeight: 700 }}>
            Delivery Speed*:
          </Typography>
        </Grid>
        <Grid item xs>
          <TextField
            required
            value={localShippingInfo.deliverySpeed ?? ""}
            error={
              canErrorCheck &&
              (localShippingInfo.deliverySpeed === undefined ||
                localShippingInfo.deliverySpeed === "")
            }
            helperText={
              !canErrorCheck
                ? undefined
                : localShippingInfo.deliverySpeed &&
                  localShippingInfo.deliverySpeed !== ""
                ? undefined
                : "Value must not be blank"
            }
            onChange={(event) => {
              setLocalShippingInfo({
                ...localShippingInfo,
                deliverySpeed: event.target.value,
              });
            }}
            onBlur={() => {
              setShippingInfo({ ...localShippingInfo });
            }}
            sx={{ width: "75%" }}
          />
        </Grid>
      </Grid>
      {destination !== DestinationTypes.CUSTOMER || disablePendingFields ? (
        <div />
      ) : (
        <Grid container item alignItems="center" spacing={2}>
          <Grid container item xs={5} justifyContent="flex-end">
            <Grid item>
              <Typography
                minWidth="max-content"
                align="right"
                sx={{ fontWeight: 700 }}
              >
                Customer Account:
              </Typography>
            </Grid>
            <Grid container item justifyContent="flex-end" alignContent="right">
              <CheckboxForm
                onChange={(checked) => {
                  setLocalShippingInfo({
                    ...localShippingInfo,
                    checkedCustomer: checked,
                  });
                }}
                label={
                  <Typography
                    minWidth="max-content"
                    justifyContent="flex-end"
                    sx={{ fontSize: 14 }}
                    align="right"
                  >
                    Charge Customer?
                  </Typography>
                }
                checkBoxSx={{ padding: 0 }}
                formControlSx={{ margin: 0 }}
                checked={localShippingInfo.checkedCustomer ?? false}
              />
            </Grid>
          </Grid>
          <Grid item xs sx={{ paddingBottom: "20px" }}>
            <TextField
              required
              value={
                localShippingInfo.checkedCustomer
                  ? localShippingInfo.customerAccount ?? ""
                  : ""
              }
              onChange={(event) => {
                setLocalShippingInfo({
                  ...localShippingInfo,
                  customerAccount: event.target.value.trim(),
                });
              }}
              onBlur={() => {
                setShippingInfo(localShippingInfo);
              }}
              disabled={!localShippingInfo.checkedCustomer}
              sx={{ width: "75%" }}
            />
          </Grid>
        </Grid>
      )}
      {disablePendingFields ? (
        <div />
      ) : (
        <>
          <Grid container item alignItems="center" spacing={2}>
            <Grid container item xs={5} justifyContent="flex-end">
              <Typography align="right" sx={{ fontWeight: 700 }}>
                Tracking:
              </Typography>
            </Grid>
            <Grid item xs>
              <TextField
                required
                value={localShippingInfo.trackingNumber ?? ""}
                onChange={(event) => {
                  setLocalShippingInfo({
                    ...localShippingInfo,
                    trackingNumber: event.target.value.trim(),
                  });
                }}
                onBlur={() => {
                  setShippingInfo(localShippingInfo);
                }}
                sx={{ width: "75%" }}
              />
            </Grid>
          </Grid>
          <Grid container item alignItems="center" spacing={2}>
            <Grid container item xs={5} justifyContent="flex-end">
              <Typography align="right" sx={{ fontWeight: 700 }}>
                Cost:
              </Typography>
            </Grid>
            <Grid item xs>
              <TextField
                required
                value={
                  !localShippingInfo.checkedCustomer
                    ? localShippingInfo.cost ?? ""
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{"$"}</InputAdornment>
                  ),
                }}
                onChange={(event) => {
                  setLocalShippingInfo({
                    ...localShippingInfo,
                    cost: event.target.value.trim(),
                  });
                }}
                onBlur={() => {
                  setShippingInfo(localShippingInfo);
                }}
                disabled={localShippingInfo.checkedCustomer}
                sx={{ width: "75%" }}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default CreateCarrierShipmentInfoForm;
