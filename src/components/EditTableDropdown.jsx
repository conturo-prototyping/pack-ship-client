import React from "react";
import { Select, MenuItem } from "@mui/material";

const EditTableDropdown = ({
  choices,
  onChange,
  value,
  valueKey,
  menuKeyValue,
  menuOptionFn,
}) => {
  return (
    <Select
      required
      value={value[valueKey]}
      onChange={(event) => {
        onChange(
          value,
          choices.find((e) => e[valueKey] === event.target.value)
        );
      }}
      MenuProps={{
        sx: { maxHeight: "250px" },
      }}
    >
      {choices.map((e) => {
        return (
          <MenuItem
            key={`${e[valueKey]}-${e[menuKeyValue]}`}
            value={e[valueKey]}
          >
            {menuOptionFn(e)}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default EditTableDropdown;
