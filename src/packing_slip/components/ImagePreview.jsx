import React from "react";
import { CardMedia } from "@mui/material";
import withStyledDismiss from "./DismissablePreview";

const ImagePreview = ({ url, height, onPreviewClick }) => {
  return (
    <CardMedia
      onClick={onPreviewClick}
      component="img"
      height={height}
      image={url}
      alt="Preview Unavailable"
      sx={{ borderRadius: 3 }}
    />
  );
};

export default withStyledDismiss(ImagePreview);
