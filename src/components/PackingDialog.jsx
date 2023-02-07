import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CommonButton from "../common/Button";
import CloseIcon from "@mui/icons-material/Close";

const PackingDialog = ({
  titleText,
  onClose,
  onSubmit,
  open,
  progressText = "Ok",
  fullWidth = true,
  maxWidth = "xl",
  actions,
  children,
  submitDisabled = false,
}) => {
  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      open={open}
      onClose={onClose}
      onBackdropClick={onClose}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
        }}>
        <DialogTitle sx={{ m: 1, p: 2, paddingTop: "1.5rem" }}>
          <Typography align="center" fontWeight="bold" fontSize={20}>
            {titleText}
          </Typography>
          <IconButton
            sx={{
              position: "absolute",
              right: 5,
              top: 5,
            }}
            onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
        {actions !== undefined ? (
          actions
        ) : (
          <DialogActions>
            <CommonButton onClick={onClose} label="Cancel" />
            <CommonButton
              disabled={submitDisabled}
              autoFocus
              onClick={onSubmit}
              label={progressText}
            />
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
};

export default PackingDialog;
