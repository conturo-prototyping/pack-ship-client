import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Preview from "./Preview";

const UploadCell = ({ params, setFilledForm, filledForm }) => {
  const [showPreview, setShowPreview] = useState(false);

  //TODO REPLACE
  const url =
    // "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    "https://fastly.picsum.photos/id/356/200/200.jpg?hmac=Pd7TXMbO4gSTwhtmub1DcSo1vPpeCVRsuY_BRE_llmU";

  useEffect(() => {
    setShowPreview(false);
  }, []);

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

  return (
    <>
      {params.row.routerUploadReady ? (
        <Preview
          height="140px"
          url={url}
          onClearClick={() => {
            setRouterUploadReady(false);
          }}
          onPreviewClick={() => setShowPreview(true)}
        ></Preview>
      ) : (
        <IconButton
          onClick={onUploadClick}
          color="primary"
          aria-label="add to shopping cart"
        >
          <UploadFileIcon />
        </IconButton>
      )}
      <Dialog
        fullWidth={true}
        maxWidth={"lg"}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      >
        <DialogContent>
          <Preview height="800rem" url={url} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadCell;
