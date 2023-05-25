import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Preview from "./Preview";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { Box } from "@mui/system";
import PDFPreview from "./PDFPreview";

const UploadCell = ({
  params,
  onUploadClick,
  viewOnly = false,
  onCloseClick = undefined,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [pdfPageNumber, setPDFPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  const url = params.row.downloadUrl || params.row.url;
  const previewType = params.row.contentType;

  function onPDFLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

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
        <>
          <DialogContent>
            <PDFPreview
              height={800}
              url={url}
              type={previewType}
              pageNumber={pdfPageNumber}
            />
          </DialogContent>

          <DialogActions>
            <IconButton
              key={params.id}
              onClick={() => setPDFPageNumber(Math.max(1, pdfPageNumber - 1))}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            Page {pdfPageNumber} of {numPages}
            <IconButton
              onClick={() =>
                setPDFPageNumber(Math.min(numPages, pdfPageNumber + 1))
              }
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          </DialogActions>
        </>
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
          onPDFLoadSuccess={onPDFLoadSuccess}
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
