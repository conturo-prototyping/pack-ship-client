import React, { useState, useEffect } from "react";
import {
  Grid,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { isCarrierValid } from "../utils/Validators";
import { CARRIERS } from "../utils/Constants";

const CarrierServiceDropdown = ({
  carrier,
  setCarrier,
  canErrorCheck,
  disabled = false,
}) => {
  const [hasSelectError, setHasSelectError] = useState(!isCarrierValid(carrier));

  useEffect(()=> {
    setHasSelectError(!isCarrierValid(carrier));
  }, [carrier]);

  return (
    <Grid item xs>
      <FormControl
        sx={{ width: "100%" }}
        error={canErrorCheck && hasSelectError}
      >
        <Select
          variant={disabled ? "standard" : "outlined"}
          disabled={disabled}
          required
          error={canErrorCheck && hasSelectError}
          sx={{ width: "100%" }}
          value={carrier}
          onChange={(event) => {
            setCarrier(event.target.value);
          }}
          onBlur={() => {
            setCarrier(carrier);
          }}
        >
          {CARRIERS.map((carrier) => (
            <MenuItem key={carrier} value={carrier}>
              {carrier}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText
          error={canErrorCheck && hasSelectError}
          sx={{ display: hasSelectError ? "block" : "none" }}
        >
          {canErrorCheck && hasSelectError
            ? "Must select non-default carrier"
            : undefined}
        </FormHelperText>
      </FormControl>
    </Grid>
  );
};
export default CarrierServiceDropdown;
