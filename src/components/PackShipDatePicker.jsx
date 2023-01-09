import React from "react";
import { TextField, FormHelperText } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const PackShipDatePicker = ({
  disabled,
  value,
  label,
  disablePast,
  onChange,
  displayDateHelper,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        disabled={disabled}
        disablePast={disablePast}
        label={label}
        value={value}
        onChange={onChange}
        renderInput={(params) => <TextField {...params} />}
      />
      {displayDateHelper ? (
        <FormHelperText error>Please Provide a Date</FormHelperText>
      ) : (
        <></>
      )}
    </LocalizationProvider>
  );
};

export default PackShipDatePicker;
