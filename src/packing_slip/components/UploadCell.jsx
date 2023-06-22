import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Preview from "./Preview";
import { Box } from "@mui/system";

export const UPLOAD_CELL_TYPES = {
  icon: "icon",
  dropzone: "dropzone",
};

const UploadCell = ({
  params,
  onUploadClick,
  viewOnly = false,
  onCloseClick = undefined,
  type = UPLOAD_CELL_TYPES.icon,
  text,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [url, setUrl] = useState(null);
  const [previewType, setPreviewType] = useState();

  useEffect(() => {
    setShowPreview(false);
    if (params.row.downloadUrl) {
      setUrl(params.row.downloadUrl);
    }
  }, [params.row.contentType, params.row.downloadUrl]);

  useEffect(() => {
    setPreviewType(selectedPreview?.type ?? params.row.contentType);
  }, [selectedPreview?.type, params.row.contentType]);

  const onUploadPress = (e) => {
    e.stopPropagation(); // don't select this row after clicking

    const url = URL.createObjectURL(e.target.files[0]);
    setUrl(url);
    onUploadClick(params, true, e.target.files[0]);
    setSelectedPreview(e.target.files[0]);
  };

  const getDialogContent = () => {
    if (previewType?.startsWith("image/")) {
      return (
        <DialogContent>
          <Preview height={800} url={url} type={previewType} />
        </DialogContent>
      );
    } else if (previewType === "application/pdf") {
      return (
        <DialogContent>
          <iframe
            title={`pdf-preview-${url}`}
            width="1000rem"
            height="800rem"
            src={url}>
            <a href={url}>Print Me</a>
          </iframe>
        </DialogContent>
      );
    } else {
      return (
        <Box>
          <p>Preview Unavailable</p>
        </Box>
      );
    }
  };

  const getUploadContent = () => {
    const uploadInput = (color = "primary") => (
      <React.Fragment>
        <input
          accept="*"
          type="file"
          id={params.id}
          style={{ display: "none" }}
          onChange={onUploadPress}
        />
        <label htmlFor={params.id}>
          <IconButton component="span" color={color}>
            <UploadFileIcon />
          </IconButton>
        </label>
      </React.Fragment>
    );

    if (type === UPLOAD_CELL_TYPES.icon) {
      return uploadInput();
    } else if (type === UPLOAD_CELL_TYPES.dropzone) {
      return (
        <>
          <input
            accept="*"
            type="file"
            id={params.id}
            style={{ display: "none" }}
            onChange={onUploadPress}
          />
          <label
            style={{ width: "100%", cursor: "pointer" }}
            htmlFor={params.id}>
            <div
              style={{
                textAlign: "center",
                padding: "20px 0px 20px 0px",
                border: "2px white dashed",
                width: "100%",
                margin: "auto",
                backgroundColor: "gainsboro",
              }}>
              {/* <IconButton component="span" color={"default"} sx={{":hover": }}> */}
              <Grid container>
                <Grid item xs={12}>
                  <UploadFileIcon />
                </Grid>
                <Grid item xs={12}>
                  <Typography>{text}</Typography>
                </Grid>
              </Grid>
              {/* </IconButton> */}
            </div>
          </label>
        </>
      );
    }
  };

  return (
    <>
      {url ? (
        <Preview
          key={url}
          height={200}
          url={url}
          type={previewType}
          onClearClick={
            !viewOnly
              ? () => {
                  if (onCloseClick) {
                    onCloseClick();
                  } else onUploadClick(params, false);
                  setUrl(null);
                }
              : undefined
          }
          onPreviewClick={() => setShowPreview(true)}
          name={selectedPreview?.name}
        />
      ) : (
        !viewOnly && getUploadContent()
      )}

      <Dialog
        maxWidth={"lg"}
        open={showPreview}
        onClose={() => setShowPreview(false)}>
        {getDialogContent()}
      </Dialog>
    </>
  );
};

export default UploadCell;
