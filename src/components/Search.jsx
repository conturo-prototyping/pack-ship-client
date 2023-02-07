import React from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const Search = ({ onSearch, autoFocus, searchString, setSearchString }) => {
  let searchTimeout;

  return (
    <TextField
      id="packing-queue-search"
      onChange={(e) => {
        setSearchString(e.target.value);

        if (searchTimeout) {
          clearTimeout(searchTimeout);
          searchTimeout = null;
        }

        searchTimeout = setTimeout(() => {
          onSearch(e.target.value);
          searchTimeout = null;
        }, 1000);
      }}
      placeholder="Search"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <IconButton
            sx={{ visibility: searchString ? "visible" : "hidden" }}
            onClick={() => setSearchString("")}
          >
            <ClearIcon />
          </IconButton>
        ),
      }}
      value={searchString}
      variant="outlined"
      autoFocus={autoFocus}
    />
  );
};

export default Search;
