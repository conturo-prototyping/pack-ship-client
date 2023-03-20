import React from "react";
import { Button, DialogTitle, IconButton, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ClearIcon from "@mui/icons-material/Clear";
import { Box } from "@mui/system";

const UploadCell = ({ params, setFilledForm, filledForm }) => {
  const setRouterUploadReady = (isReady) => {
    params.api.updateRows([{ id: params.id, routerUploadReady: isReady }]);

    setFilledForm(
      filledForm.map((e) => {
        if (Object.keys(params).includes(e.id)) {
          return {
            ...e,
            routerUploadReady: isReady,
          };
        }
        return e;
      })
    );
  };

  const onUploadClick = (e) => {
    e.stopPropagation(); // don't select this row after clicking

    setRouterUploadReady(true);
    console.log("mock cell ready to upload file"); //TODO REMOVE
  };

  return params.row.routerUploadReady ? (
    <Box sx={{ height: "150px", width: "100px" }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Box>Preview PDF Here</Box>
        <IconButton
          style={{ position: "absolute", top: "5%", right: "5%" }}
          onClick={() => {
            setRouterUploadReady(false);
          }}
        >
          <ClearIcon />
        </IconButton>
      </DialogTitle>
    </Box>
  ) : (
    <IconButton
      onClick={onUploadClick}
      color="primary"
      aria-label="add to shopping cart"
    >
      <UploadFileIcon />
    </IconButton>
  );
};

export default UploadCell;
