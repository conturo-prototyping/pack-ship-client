import { Box, Dialog, DialogContent } from "@mui/material";
import Preview from "../packing_slip/components/Preview";

const PreviewPopup = ({
  height,
  onClose,
  showPreview,
  type,
  url,
  onPreviewClick,
}) => {
  const getDialogContent = () => {
    if (type?.startsWith("image/")) {
      return (
        <DialogContent>
          <Preview
            height={height}
            url={url}
            type={type}
            onPreviewClick={onPreviewClick}
          />
        </DialogContent>
      );
    } else if (type === "application/pdf") {
      return (
        <DialogContent>
          <iframe
            title={`pdf-preview-${url}`}
            width="1000rem"
            height={`${height}rem`}
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
    <Dialog maxWidth={"lg"} open={showPreview} onClose={onClose}>
      {getDialogContent()}
    </Dialog>
  );
};

export default PreviewPopup;
