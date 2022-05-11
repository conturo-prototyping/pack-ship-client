import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CommonButton from "../common/Button";

const ConfirmDialog = (props) => {
  const { title, children, open, setOpen, onConfirm } = props;
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <CommonButton
          onClick={() => setOpen(false)}
          label="No"
          color="secondary"
        />
        <CommonButton
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          label="Yes"
        />
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;
