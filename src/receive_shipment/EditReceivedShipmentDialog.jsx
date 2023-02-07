import React, { useState, useEffect, useMemo, useCallback } from "react";
import PackingDialog from "../components/PackingDialog";
import ReceiveShipmentTable from "./components/ReceiveShipmentTable";
import { DialogActions } from "@mui/material";
import CommonButton from "../common/Button";
import PackShipDatePicker from "../components/PackShipDatePicker";
import dayjs from "dayjs";
import { WORK_ORDER_PO } from "../common/ItemTypes";

const EditReceiveShipmentDialog = ({
  onSubmit,
  open,
  onClose,
  parts,
  title,
  actions = undefined,
  viewOnly = false,
}) => {
  const [filledForm, setFilledForm] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [displayDateHelper, setDisplayDateHelper] = useState(false);
  const [receivedOn, setReceivedOn] = useState(undefined);
  const [type, setType] = useState(WORK_ORDER_PO);

  const rowData = useMemo(() => {
    const receivedQuantities = parts?.linesReceived;

    if (receivedQuantities) {
      return receivedQuantities.map((e) => {
        return {
          ...e,
          id: e._id,
          qtyReceived: e.qty || e.qtyReceived,
          qty: e.Quantity,
          partDescription: e.PartName,
          partNumber: e.PartNumber,
          item: e.item,
        };
      });
    }
    return [];
  }, [parts]);

  useEffect(() => {
    if (parts) {
      setType(parts?.sourcePoType);
    }
  }, [parts]);

  const originalReceivedOn = useMemo(() => parts.receivedOn, [parts]);

  useEffect(() => {
    setReceivedOn(dayjs(parts.receivedOn));
  }, [parts]);

  useEffect(() => {
    setFilledForm(rowData);
    setOriginalData(rowData);
  }, [rowData]);

  useEffect(() => {
    setDisplayDateHelper(!receivedOn?.isValid() || receivedOn === undefined);
  }, [receivedOn]);

  const isSubmittable = useCallback(() => {
    const hasChanged = () => {
      return (
        filledForm?.some(
          (e, index) => e.qtyReceived !== originalData[index].qtyReceived
        ) || receivedOn !== originalReceivedOn
      );
    };

    return (
      filledForm?.some(
        (e) => e.qtyReceived !== undefined && e.qtyReceived > 0
      ) &&
      hasChanged() &&
      !displayDateHelper &&
      receivedOn?.isValid()
    );
  }, [
    displayDateHelper,
    filledForm,
    receivedOn,
    originalReceivedOn,
    originalData,
  ]);

  const generateActions = useMemo(() => {
    return (
      <DialogActions sx={{ padding: 3, display: "flex", flexGrow: 4 }}>
        <PackShipDatePicker
          disabled={viewOnly}
          value={receivedOn}
          disablePast={false}
          label="Date Received"
          onChange={(newValue) => {
            setReceivedOn(newValue);
            setDisplayDateHelper(false);
          }}
          displayDateHelper={displayDateHelper}
        />
        <div style={{ flex: "1 0 0" }} />
        {viewOnly ? (
          <></>
        ) : (
          <>
            <CommonButton onClick={onClose} label="Cancel" />
            <CommonButton
              disabled={!isSubmittable()}
              autoFocus
              onClick={() => onSubmit(filledForm, parts?.id, receivedOn)}
              label={"Ok"}
            />
          </>
        )}
      </DialogActions>
    );
  }, [
    receivedOn,
    filledForm,
    isSubmittable,
    onClose,
    onSubmit,
    parts,
    displayDateHelper,
    viewOnly,
  ]);

  return (
    <PackingDialog
      open={open}
      titleText={title}
      s
      onClose={onClose}
      onBackdropClick={onClose}
      onSubmit={() => onSubmit(filledForm, parts?._id, receivedOn)}
      submitDisabled={!isSubmittable()}
      actions={actions ? actions : generateActions}>
      <ReceiveShipmentTable
        rowData={rowData}
        filledForm={filledForm}
        setFilledForm={setFilledForm}
        viewOnly={viewOnly}
        type={type}
      />
    </PackingDialog>
  );
};

export default EditReceiveShipmentDialog;
