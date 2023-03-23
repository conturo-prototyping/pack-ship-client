import React from "react";
import { Card, CardActionArea, CardMedia, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/system";

const ImagePreview = ({ url, height, onClearClick, onPreviewClick }) => {
  return (
    <Box sx={{ padding: "20px" }}>
      <CardActionArea>
        <Card>
          <CardMedia
            onClick={onPreviewClick}
            component="img"
            height={height}
            image={url}
            alt="Preview Unavailable"
            sx={{ borderRadius: 3 }}
          />
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

export default ImagePreview;
