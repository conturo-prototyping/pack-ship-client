import React, { useState, useEffect } from "react";
import {
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
  width = "100%",
  disabled = false,
}) => {
  const [localCarrier, setLocalCarrier] = useState(carrier);
  const [hasSelectError, setHasSelectError] = useState(
    !isCarrierValid(carrier)
  );

  useEffect(() => {
    setLocalCarrier(carrier);
    setHasSelectError(!isCarrierValid(carrier));
  }, [carrier]);

  return (
    <FormControl sx={{ width: width }} error={canErrorCheck && hasSelectError}>
      <Select
        variant={disabled ? "standard" : "outlined"}
        disabled={disabled}
        required
        error={canErrorCheck && hasSelectError}
        sx={{ width: "100%" }}
        value={localCarrier}
        onChange={(event) => {
          setHasSelectError(!isCarrierValid(event.target.value));
          setLocalCarrier(event.target.value);
        }}
        onBlur={() => {
          setCarrier(localCarrier);
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
  );
};
export default CarrierServiceDropdown;
