import {
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

const DestinationToggle = ({
  destination,
  onDestinationChange,
  disabled = false,
}) => {
  return (
    <Grid container justifyContent="flex-start" spacing={1}>
      <Grid item container alignItems="center" xs={"auto"}>
        <Typography
          style={{ display: "block" }}
          fontWeight="bold"
          fontSize={16}
        >
          Destination:
        </Typography>
      </Grid>
      <Grid container item xs={"auto"}>
        <ToggleButtonGroup
          disabled={disabled}
          color="primary"
          value={destination}
          exclusive
          onChange={onDestinationChange}
        >
          <ToggleButton value="vendor">Vendor</ToggleButton>
          <ToggleButton value="customer">Customer</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
};

export default DestinationToggle;
