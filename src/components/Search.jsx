import React from "react";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Search = ({ onSearch, autoFocus }) => {

  let searchTimeout;

  return (
    <TextField
      id="packing-queue-search"
      onChange={(e) => {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          searchTimeout = null;
        }

        searchTimeout = setTimeout(() => {
          console.log('SEARCH');
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
      }}
      variant="outlined"
      autoFocus={autoFocus}
    />
  );
};

export default Search;
