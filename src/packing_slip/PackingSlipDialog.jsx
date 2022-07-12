import React, { useState, useEffect } from "react";
import PackingSlipTable from "./components/PackingSlipTable";
import PackingDialog from "../components/PackingDialog";
import {
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Grid,
} from "@mui/material";
import DestinationToggle from "./components/DestinationToggle";

const PackingSlipDialog = ({
  onSubmit,
  open,
  onClose,
  orderNum,
  parts,
  title,
  onDestinationChange,
  destination = "customer",
  actions = undefined,
  viewOnly = false,
}) => {
  const [filledForm, setFilledForm] = useState([]);

  useEffect(() => {
    setFilledForm(parts);
  }, [parts]);

  function isSubmittable() {
    return filledForm.every((e) => e.packQty && e.packQty >= 0);
  }

  return (
    <PackingDialog
      open={open}
      titleText={title}
      onClose={onClose}
      onBackdropClick={onClose}
      onSubmit={() => onSubmit(filledForm, orderNum)}
      submitDisabled={!isSubmittable()}
      actions={actions}
    >
      <DestinationToggle
        destination={destination}
        onDestinationChange={onDestinationChange}
      ></DestinationToggle>

      <PackingSlipTable
        rowData={parts}
        filledForm={filledForm}
        setFilledForm={setFilledForm}
        viewOnly={viewOnly}
      />
    </PackingDialog>
  );
};

export default PackingSlipDialog;
