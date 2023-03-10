import { Grid, Typography, TextField } from "@mui/material";

const ShippingAddressForm = ({
  shippingAddress,
  setShippingAddress,
  canErrorCheck,
}) => {
  return (
    <Grid container item alignItems="center" spacing={4}>
      <Grid container item xs={5} justifyContent="flex-end">
        <div style={{ display: "flex" }}>
          <Typography
            sx={{ fontWeight: 900, paddingRight: "5px", paddingLeft: "10px" }}
            noWrap
          >
            Shipping Address:
          </Typography>
        </div>
      </Grid>
      <Grid item xs>
        <TextField
          multiline
          required
          autoFocus
          minRows={4}
          maxRows={4}
          value={shippingAddress}
          onChange={(event) => {
            setShippingAddress(event.target.value);
          }}
          error={
            canErrorCheck &&
            (shippingAddress === undefined || shippingAddress === "")
          }
          helperText={
            !canErrorCheck
              ? undefined
              : shippingAddress && shippingAddress !== ""
              ? undefined
              : "Value must not be blank"
          }
        />
      </Grid>
    </Grid>
  );
};

export default ShippingAddressForm;
