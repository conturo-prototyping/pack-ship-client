import * as React from "react";
import Button from "@mui/material/Button";
import makeStyles from "@mui/styles/makeStyles";

const useStyle = makeStyles((theme) => ({
  text: {
    textTransform: "none",
  },
}));

const MakePackingSlipButton = ({ onClick, disabled = false }) => {
  const classes = useStyle();
  return (
    <Button className={classes.text} disabled={disabled} onClick={onClick} variant="contained">
      Make Packing Slip
    </Button>
  );
};

export default MakePackingSlipButton;
