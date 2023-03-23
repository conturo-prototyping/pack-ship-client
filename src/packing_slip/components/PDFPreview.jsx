import React, { useState } from "react";
import { Card, CardActionArea, CardMedia, IconButton } from "@mui/material";

import { Box } from "@mui/system";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import withStyledDismiss from "./DismissablePreview";

const PDFPreview = ({
  url,
  pageNumber,
  height,
  onPreviewClick,
  onLoadSuccess,
}) => {
  return (
    <Document onClick={onPreviewClick} file={url} onLoadSuccess={onLoadSuccess}>
      <Page height={height} pageNumber={pageNumber} renderTextLayer={false} />
    </Document>
  );
};

export default withStyledDismiss(PDFPreview);
