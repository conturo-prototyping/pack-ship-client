import { Grid, Typography, TextField } from "@mui/material";

const ShippingAddressForm = ({ shippingAddress, setShippingAddress }) => {
  return (
    <Grid container item alignItems="center" spacing={4}>
      <Grid container item xs={5} justifyContent="flex-end">
        <div style={{ display: "flex" }}>
          <Typography
            sx={{ fontWeight: 900, paddingRight: "5px", paddingLeft: "10px" }}
            noWrap>
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
        />
      </Grid>
    </Grid>
  );
};

export default ShippingAddressForm;
