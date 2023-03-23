import React from "react";
import { Box } from "@mui/system";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import withStyledDismiss from "./DismissablePreview";

const UnknownFilePreview = ({ name }) => {
  return (
    <Box>
      <BrokenImageIcon />
      <p>Preview Unavailable for {name}</p>
    </Box>
  );
};

export default withStyledDismiss(UnknownFilePreview);
