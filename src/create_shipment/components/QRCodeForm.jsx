import { Grid, Typography, TextField, Box } from "@mui/material";

const QRCodeForm = ({ source }) => {
  return (
    <Grid container item alignItems="center" spacing={4} direction="column">
      <Grid container item xs={5} justifyContent="flex-end">
        <Typography
          sx={{ fontWeight: 900, paddingRight: "5px", paddingLeft: "10px" }}
        >
          Scan the QR Code below to upload pictures relevant to this shipment
        </Typography>
      </Grid>
      <Grid item xs>
        <Box
          sx={{
            width: 300,
            height: 300,
          }}
          style={{ backgroundImage: `url(${source})` }}
        />
      </Grid>
    </Grid>
  );
};

export default QRCodeForm;
