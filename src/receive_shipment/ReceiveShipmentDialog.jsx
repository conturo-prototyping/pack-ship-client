import React, { useState, useEffect } from "react";
import PackingDialog from "../components/PackingDialog";
import ReceiveShipmentTable from "./components/ReceiveShipmentTable";

const ReceiveShipmentDialog = ({
  onSubmit,
  open,
  onClose,
  orderNum,
  parts,
  title,
  onDestinationChange,
  destination = "CUSTOMER",
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
      <ReceiveShipmentTable
        rowData={parts}
        filledForm={filledForm}
        setFilledForm={setFilledForm}
        viewOnly={viewOnly}
      />
    </PackingDialog>
  );
};

export default ReceiveShipmentDialog;
