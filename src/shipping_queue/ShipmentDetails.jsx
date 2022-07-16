import React from "react";
import { Typography, Grid } from "@mui/material";
import TitleTextInput from "../components/TitleTextInput";
import CarrierServiceDropdown from "../components/CarrierServiceDropdown";
import { isDeliverySpeedValid } from "../utils/Validators";

const ShipmentDetails = ({
  canErrorCheck,
  shipment,
  onCarrierInputChange,
  onDeliverySpeedChange,
  onCustomerAccountChange,
  onCustomerNameChange,
  onShippingAddressChange,
  onTrackingChange,
  onCostChange,
  viewOnly = true,
}) => {
  return (
    <div>
      <Grid container direction="row" alignItems="flex-start" spacing={10}>
        {shipment?.manifest.find((e) => e?.destination === "VENDOR") !==
        undefined ? (
          <Grid item container xs={3} direction="column">
            <TitleTextInput
              title="Shipping Address:"
              value={shipment?.shippingAddress}
              viewOnly={viewOnly}
              onChange={onShippingAddressChange}
              direction="column"
              variant="outlined"
              spacing={1}
              multiline={5}
            />
          </Grid>
        ) : (
          <></>
        )}
        <Grid item container xs={8} direction="row">
          {(() => {
            switch (shipment?.deliveryMethod) {
              case "CARRIER":
                return (
                  <Grid container direction="row" alignItems="flex-start">
                    <Grid item container xs={6} direction="column">
                      <TitleTextInput
                        title="Delivery Method:"
                        value={shipment?.deliveryMethod}
                        viewOnly={true}
                        onChange={onTrackingChange}
                      />
                      {viewOnly ? (
                        <TitleTextInput
                          title="Carrier Service:"
                          value={shipment?.carrier}
                          viewOnly={viewOnly}
                        />
                      ) : (
                        <Grid
                          item
                          container
                          direction="row"
                          alignItems="center"
                          spacing={5}
                        >
                          <Grid item container xs={3} justifyContent="flex-end">
                            <Typography sx={{ fontWeight: 900 }}>
                              {"Carrier Service:"}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <CarrierServiceDropdown
                              canErrorCheck={canErrorCheck}
                              carrier={shipment?.carrier}
                              setCarrier={onCarrierInputChange}
                              disabled={viewOnly}
                              width={"100%"}
                            />
                          </Grid>
                        </Grid>
                      )}
                      <TitleTextInput
                        title="Delivery Speed:"
                        value={shipment?.deliverySpeed}
                        viewOnly={viewOnly}
                        onChange={onDeliverySpeedChange}
                        error={!isDeliverySpeedValid(shipment?.deliverySpeed)}
                        canErrorCheck={canErrorCheck}
                      />
                      <TitleTextInput
                        title="Customer Account:"
                        value={
                          shipment?.customerAccount === "false"
                            ? ""
                            : shipment?.customerAccount
                        }
                        viewOnly={viewOnly}
                        onChange={onCustomerAccountChange}
                      />
                    </Grid>
                    <Grid item container xs={6} direction="column">
                      <TitleTextInput
                        title="Tracking:"
                        value={shipment?.trackingNumber}
                        viewOnly={viewOnly}
                        onChange={onTrackingChange}
                      />
                      <TitleTextInput
                        title="Cost:"
                        value={shipment?.cost}
                        viewOnly={viewOnly}
                        onChange={onCostChange}
                      />
                    </Grid>
                  </Grid>
                );
              case "DROPOFF":
              case "PICKUP":
              default:
                return (
                  <React.Fragment>
                    <TitleTextInput
                      title="Delivery Method:"
                      value={shipment?.deliveryMethod}
                      viewOnly={true}
                      onChange={onTrackingChange}
                    />
                    <TitleTextInput
                      title="Received By:"
                      value={shipment?.customerHandoffName}
                      viewOnly={viewOnly}
                      onChange={onCustomerNameChange}
                    />
                  </React.Fragment>
                );
            }
          })()}
        </Grid>
      </Grid>
    </div>
  );
};

export default ShipmentDetails;
