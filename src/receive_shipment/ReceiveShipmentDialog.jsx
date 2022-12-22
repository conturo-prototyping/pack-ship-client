import React, { useState, useEffect, useMemo } from "react";
import { CONSUMABLE_PO, WORK_ORDER_PO } from "../common/ItemTypes";
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
    if (parts?.length > 0) {
      const manifest = parts[0]?.manifest;
      if (manifest)
        if (parts[0].poType === WORK_ORDER_PO)
          return manifest
            .map((e) => {
              return e.lines.map((m) => {
                return {
                  id: e._id + m._id,
                  poId: e._id,
                  lineId: m._id,
                  item: m.item,
                  order: m.packingSlip.orderNumber,
                  partNumber: m.item.PartNumber,
                  partRev: m.item.Revision,
                  partDescription: m.item.PartName,
                  batch: m.item.batchNumber,
                  qty: m.qtyRequested,
                  poNum: e.PONumber,
                  poType: parts[0].poType,
                };
              });
            })
            .reduce((curr, acc) => {
              return curr.concat(acc);
            }, []);
        else if (parts[0].poType === CONSUMABLE_PO)
          return manifest
            .map((e) => {
              return e.lines.map((m) => {
                return {
                  id: e._id + m._id,
                  poId: e._id,
                  lineId: m._id,
                  item: m.item,
                  qty: m.qtyRequested,
                  poNum: e.PONumber,
                  poType: parts[0].poType,
                };
              });
            })
            .reduce((curr, acc) => {
              return curr.concat(acc);
            }, []);
    }
    return [];
  }, [parts]);

  useEffect(() => {
    setFilledForm(rowData);
  }, [rowData]);

  function isSubmittable() {
    return filledForm.some((e) => e.qtyReceived && e.qtyReceived >= 0);
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
        type={parts ? parts[0]?.poType : WORK_ORDER_PO}
      />
    </PackingDialog>
  );
};

export default ReceiveShipmentDialog;
