import React, { useState } from "react";
import { Card, CardActionArea, CardMedia, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/system";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

const PDFPreview = ({
  url,
  pageNumber,
  height,
  onClearClick,
  onPreviewClick,
  onLoadSuccess,
}) => {
  return (
    <Box sx={{ padding: "20px" }}>
      <CardActionArea>
        <Card>
          <Document
            onClick={onPreviewClick}
            file={url}
            onLoadSuccess={onLoadSuccess}
          >
            <Page
              height={height}
              pageNumber={pageNumber}
              renderTextLayer={false}
            />
          </Document>
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

export default PDFPreview;
