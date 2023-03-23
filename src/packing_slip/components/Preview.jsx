import React, { useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import PDFPreview from "./PDFPreview";
import ImagePreview from "./ImagePreview";
import UnknownFilePreview from "./UnknownFilePreview";

const Preview = ({
  name,
  height,
  url,
  type,
  onClearClick,
  onPreviewClick,
  onPDFLoadSuccess,
}) => {
  const getPreviewForType = (type) => {
    if (type?.startsWith("image/")) {
      return (
        <ImagePreview
          url={url}
          onPreviewClick={onPreviewClick}
          height={height}
          onClearClick={onClearClick}
        />
      );
    } else if (type === "application/pdf") {
      return (
        <PDFPreview
          url={url}
          pageNumber={1}
          onPreviewClick={onPreviewClick}
          height={height}
          onClearClick={onClearClick}
          onLoadSuccess={onPDFLoadSuccess}
        />
      );
    } else {
      return <UnknownFilePreview name={name} onClearClick={onClearClick} />;
    }
  };

  return getPreviewForType(type);
};

export default Preview;
