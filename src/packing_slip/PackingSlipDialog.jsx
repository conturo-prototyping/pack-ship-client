import React, { useState, useEffect } from "react";
import PackingSlipTable from "./components/PackingSlipTable";
import DestinationToggle from "./components/DestinationToggle";
import PackingDialog from "../components/PackingDialog";
import { DestinationTypes } from "../utils/Constants";

const PackingSlipDialog = ({
  onSubmit,
  open,
  onClose,
  orderNum,
  parts,
  title,
  onDestinationChange,
  destination,
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
      onSubmit={() => onSubmit(filledForm, orderNum, destination)}
      submitDisabled={!isSubmittable()}
      actions={actions}>
      <DestinationToggle
        disabled={!!destination}
        destination={destination || DestinationTypes.CUSTOMER}
        onDestinationChange={onDestinationChange}></DestinationToggle>

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
