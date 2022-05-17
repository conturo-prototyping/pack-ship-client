import React, { useState, useEffect } from "react";
import PackingSlipTable from "./components/PackingSlipTable";
import PackingDialog from "../components/PackingDialog";

const PackingSlipDialog = ({
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
