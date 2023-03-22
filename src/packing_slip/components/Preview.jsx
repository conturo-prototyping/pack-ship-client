import React from "react";
import { Card, CardActionArea, CardMedia, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/system";

const Preview = ({ height, url, onClearClick, onPreviewClick }) => {
  return (
    <Card elevation={0} sx={{ padding: "15px" }}>
      <CardActionArea>
        {/* <object
          data={url}
          //   type="application/pdf"
          width="100%"
          height="100%"
        ></object> */}
        {/* <Document file={url}>
          <Page pageNumber={0} />
        </Document> */}
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
            <IconButton sx={{ backgroundColor: "red" }} onClick={onClearClick}>
              <ClearIcon />
            </IconButton>
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
};

export default Preview;
