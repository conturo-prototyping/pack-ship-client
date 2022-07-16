import { Grid, Typography } from "@mui/material";
import TextInput from "./TextInput";

const TitleTextInput = ({
  title,
  value,
  viewOnly,
  onChange,
  error = false,
  canErrorCheck = false,
  direction = "row",
  variant = null,
  spacing = 5,
  multiline = 1,
}) => {
  return (
    <Grid
      item
      container
      direction={direction}
      alignItems="center"
      spacing={spacing}
    >
      <Grid item container xs={3} justifyContent="flex-start">
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      </Grid>
      <Grid item xs={4} container justifyContent="flex-start">
        <TextInput
          onChange={onChange}
          readOnly={viewOnly}
          value={value}
          error={error}
          canErrorCheck={canErrorCheck}
          variant={variant}
          multiline={multiline}
        />
      </Grid>
    </Grid>
  );
};

export default TitleTextInput;
