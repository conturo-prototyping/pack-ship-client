import React from "react";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Search = ({ onSearch }) => {
  return (
    <TextField
      id="packing-queue-search"
      onChange={(e) => {
        onSearch(e.target.value);
      }}
      placeholder="Search"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      variant="outlined"
    />
  );
};

export default Search;
