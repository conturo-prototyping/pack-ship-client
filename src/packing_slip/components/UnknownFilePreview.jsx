import React from "react";
import { Card, CardActionArea, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/system";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

const UnknownFilePreview = ({ name, onClearClick }) => {
  return (
    <Box sx={{ padding: "20px" }}>
      <CardActionArea>
        <Card>
          <Box>
            <BrokenImageIcon />
            <p>Preview Unavailable for {name}</p>
          </Box>
          {onClearClick && (
            <Box
              sx={{
                position: "absolute",
                top: "-5%",
                right: "-5%",
              }}
            >
              <IconButton
                sx={{ backgroundColor: "red" }}
                onClick={onClearClick}
              >
                <ClearIcon />
              </IconButton>
            </Box>
          )}
        </Card>
      </CardActionArea>
    </Box>
  );
};

export default UnknownFilePreview;
