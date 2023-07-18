import { Grid, Typography, TextField, Box } from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";
import UploadCell, {
  UPLOAD_CELL_TYPES,
} from "../../packing_slip/components/UploadCell";

const PickupDropOffForm = ({
  customerName,
  setCustomerName,
  setUploadedImage,
}) => {
  return (
    <Box>
      <Grid
        container
        justifyContent="center"
        alignContent="center"
        alignItems="center"
        sx={{ marginBottom: "1rem" }}>
        <Grid item xs={5}>
          <div style={{ display: "flex" }}>
            <Typography
              sx={{ fontWeight: 900, paddingRight: "5px", paddingLeft: "10px" }}
              noWrap>
              Received By
            </Typography>
            <HelpTooltip tooltipText="Enter the name of the person you are handing off this delivery to." />
          </div>
        </Grid>
        <Grid item xs={6}>
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

      <UploadCell
        key={"uploadCell"}
        params={{ id: "uploadCell", row: {} }}
        onUploadClick={(_, __, file) => {
          setUploadedImage({ file });
        }}
        onCloseClick={() => {
          setUploadedImage(undefined);
        }}
        type={UPLOAD_CELL_TYPES.dropzone}
        text={"Please upload a copy of the signed packing slip to continue"}
      />
    </Box>
  );
};

export default PickupDropOffForm;
