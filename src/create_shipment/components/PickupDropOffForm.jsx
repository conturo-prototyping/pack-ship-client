import { Grid, Typography, TextField } from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";

const PickupDropOffForm = ({ customerName, setCustomerName }) => {
  return (
    <Grid container item alignItems="center" spacing={4}>
      <Grid container item xs={5} justifyContent="flex-end">
        <div style={{ display: "flex" }}>
          <Typography
            sx={{ fontWeight: 900, paddingRight: "5px", paddingLeft: "10px" }}
            noWrap
          >
            Received By
          </Typography>
          <HelpTooltip tooltipText="Enter the name of the person who has picked up this delivery." />
        </div>
      </Grid>
      <Grid item xs>
        <TextField
          required
          autoFocus
          value={customerName}
          onChange={(event) => {
            setCustomerName(event.target.value);
          }}
        />
      </Grid>
    </Grid>
  );
};

export default PickupDropOffForm;
