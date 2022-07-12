import React, { useState, useEffect } from "react";
import PackingSlipTable from "./components/PackingSlipTable";
import PackingDialog from "../components/PackingDialog";
import {
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Grid,
} from "@mui/material";

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
      <Grid container justifyContent="flex-start" spacing={1}>
        <Grid item container alignItems="center" xs={"auto"}>
          <Typography
            style={{ display: "block" }}
            fontWeight="bold"
            fontSize={16}
          >
            Destination:
          </Typography>
        </Grid>
        <Grid container item xs={"auto"}>
          <ToggleButtonGroup
            color="primary"
            value={destination}
            exclusive
            onChange={onDestinationChange}
          >
            <ToggleButton value="vendor">Vendor</ToggleButton>
            <ToggleButton value="customer">Customer</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

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
