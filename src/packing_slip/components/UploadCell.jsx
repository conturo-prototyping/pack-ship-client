import React, { useEffect, useState } from "react";
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

const UploadCell = ({ params, setFilledForm, filledForm }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [url, setUrl] = useState(null);

  const [pdfPageNumber, setPDFPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    setShowPreview(false);
  }, []);

  useEffect(() => {
    if (selectedPreview) {
      console.log(selectedPreview);
      setUrl(URL.createObjectURL(selectedPreview));
      setPreviewType(selectedPreview.type);
    }
  }, [selectedPreview]);

  function onPDFLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

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
    setSelectedPreview(e.target.files[0]);
    console.log("mock cell ready to upload file"); //TODO REMOVE
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
      {params.row.routerUploadReady ? (
        <Preview
          height={200}
          url={url}
          type={previewType}
          onClearClick={() => {
            setRouterUploadReady(false);
          }}
          onPreviewClick={() => setShowPreview(true)}
          onPDFLoadSuccess={onPDFLoadSuccess}
          name={selectedPreview?.name}
        ></Preview>
      ) : (
        <>
          <input
            accept="*"
            type="file"
            id="select-image"
            style={{ display: "none" }}
            onChange={onUploadClick}
          />
          <label htmlFor="select-image">
            <IconButton component="span" color="primary">
              <UploadFileIcon />
            </IconButton>
          </label>
        </>
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
