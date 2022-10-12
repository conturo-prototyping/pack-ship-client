import React, { useState, useEffect, useMemo } from "react";
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

  const rowData = useMemo(() => {
    const manifest = parts[0]?.manifest;
    if (manifest)
      return manifest.map((e) => {
        return {
          shipmentID: parts[0].id,
          id: e.item._id,
          batch: e.item.batch,
          orderNumber: e.item.orderNumber,
          partDescription: e.item.partDescription,
          partNumber: e.item.partNumber,
          partRev: e.item.partRev,
          qty: e.qty,
        };
      });
    return [];
  }, [parts]);

  useEffect(() => {
    setFilledForm(rowData);
  }, [rowData]);

  function isSubmittable() {
    return filledForm.every((e) => e.qtyReceived && e.qtyReceived >= 0);
  }

  return (
    <PackingDialog
      open={open}
      titleText={title}
      onClose={onClose}
      onBackdropClick={onClose}
      onSubmit={() => onSubmit(filledForm, parts[0]?.id)}
      submitDisabled={!isSubmittable()}
      actions={actions}>
      <ReceiveShipmentTable
        rowData={rowData}
        filledForm={filledForm}
        setFilledForm={setFilledForm}
        viewOnly={viewOnly}
      />
    </PackingDialog>
  );
};

export default ReceiveShipmentDialog;
