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
  actions = undefined,
  viewOnly = false,
}) => {
  const [filledForm, setFilledForm] = useState([]);

  useEffect(() => {
    console.log("HEY", parts);
    setFilledForm(parts);
  }, [parts]);

  function isSubmittable() {
    return filledForm.every((e) => e.receivedQty && e.receivedQty >= 0);
  }

  return (
    <PackingDialog
      open={open}
      titleText={title}
      onClose={onClose}
      onBackdropClick={onClose}
      onSubmit={() => onSubmit(filledForm, orderNum)}
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
