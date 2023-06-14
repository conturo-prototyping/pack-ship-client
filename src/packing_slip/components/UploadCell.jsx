import React, { useState } from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Preview from "./Preview";
import { Box } from "@mui/system";

const UploadCell = ({
  params,
  onUploadClick,
  viewOnly = false,
  onCloseClick = undefined,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);

  const url = params.row.downloadUrl || params.row.url;
  const previewType = params.row.contentType;

  const onUploadPress = (e) => {
    e.stopPropagation(); // don't select this row after clicking

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
            src={url}
          >
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
                }
              : undefined
          }
          onPreviewClick={() => setShowPreview(true)}
          name={selectedPreview?.name}
        ></Preview>
      ) : (
        !viewOnly && (
          <>
            <input
              accept="*"
              type="file"
              id={params.id}
              style={{ display: "none" }}
              onChange={onUploadPress}
            />
            <label htmlFor={params.id}>
              <IconButton component="span" color="primary">
                <UploadFileIcon />
              </IconButton>
            </label>
          </>
        )
      )}

      <Dialog
        maxWidth={"lg"}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      >
        {getDialogContent()}
      </Dialog>
    </>
  );
};

export default UploadCell;
