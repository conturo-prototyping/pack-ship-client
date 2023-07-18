import React from "react";
import { Document, Page, pdfjs } from "react-pdf/dist/esm/entry.webpack5";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import withStyledDismiss from "./DismissablePreview";

const url = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = url;

const PDFPreview = ({ url, pageNumber, height, onPreviewClick }) => {
  return (
    <Document onClick={onPreviewClick} file={url}>
      <Page height={height} pageNumber={pageNumber} renderTextLayer={false} />
    </Document>
  );
};

export default withStyledDismiss(PDFPreview);
