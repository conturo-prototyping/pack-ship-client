import { Grid, Typography } from "@mui/material";
import TextInput from "./TextInput";

const TitleTextInput = ({
  title,
  value,
  viewOnly,
  onChange,
  error = false,
  canErrorCheck = false,
}) => {
  return (
    <Grid item container direction="row" alignItems="center" spacing={5}>
      <Grid item container xs={3} justifyContent="flex-end">
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      </Grid>
      <Grid item xs={4}>
        <TextInput
          onChange={onChange}
          readOnly={viewOnly}
          value={value}
          error={error}
          canErrorCheck={canErrorCheck}
        />
      </Grid>
    </Grid>
  );
};

export default TitleTextInput;
