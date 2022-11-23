import React, { useState, useEffect, useMemo, useCallback } from "react";
import PackingDialog from "../components/PackingDialog";
import ReceiveShipmentTable from "./components/ReceiveShipmentTable";
import { DialogActions, Grid, Typography } from "@mui/material";
import CommonButton from "../common/Button";
import PackShipDatePicker from "../components/PackShipDatePicker";

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
  const [receivedOn, setReceivedOn] = useState("");

  const originalReceivedOn = useMemo(() => parts[0]?.receivedOn, [parts]);

  const rowData = useMemo(() => {
    const manifest = parts[0]?.manifest;
    if (manifest)
      return manifest.map((e) => {
        return {
          label: parts[0].label,
          id: e.item._id,
          batch: e.item.batch,
          orderNumber: e.item.orderNumber,
          partDescription: e.item.partDescription,
          partNumber: e.item.partNumber,
          partRev: e.item.partRev,
          qty: e.qty,
          qtyReceived: e.qtyReceived || 0,
        };
      });
    return [];
  }, [parts]);

  useEffect(() => {
    setFilledForm(rowData);
    setOriginalData(rowData);
  }, [rowData]);

  useEffect(() => {
    setDisplayDateHelper(receivedOn === "" || receivedOn === undefined);
  }, [receivedOn]);

  const isSubmittable = useCallback(() => {
    const hasChanged = () => {
      return (
        filledForm.some(
          (e, index) => e.qtyReceived !== originalData[index].qtyReceived
        ) || receivedOn !== originalReceivedOn
      );
    };

    return (
      filledForm.every(
        (e) => e.qtyReceived !== undefined && e.qtyReceived > 0
      ) &&
      hasChanged() &&
      !displayDateHelper
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
      <DialogActions sx={{ display: "flex", flexGrow: 4 }}>
        <Grid
          xs={3}
          container
          item
          direction="row"
          spacing={0}
          justifyContent="left">
          <Grid xs={4} container item alignItems={"center"}>
            <Typography sx={{ fontWeight: "bold", alignItems: "center" }}>
              Date Received:
            </Typography>
          </Grid>
          <Grid item xs={8}>
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
          </Grid>
        </Grid>
        <div style={{ flex: "1 0 0" }} />
        {viewOnly || (
          <>
            <CommonButton onClick={onClose} label="Cancel" />
            <CommonButton
              disabled={!isSubmittable()}
              autoFocus
              onClick={() => onSubmit(filledForm, parts[0]?.id, receivedOn)}
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
      onClose={onClose}
      onBackdropClick={onClose}
      onSubmit={() => onSubmit(filledForm, parts[0]?.id)}
      submitDisabled={!isSubmittable()}
      actions={actions ? actions : generateActions}>
      <ReceiveShipmentTable
        rowData={rowData}
        filledForm={filledForm}
        setFilledForm={setFilledForm}
        viewOnly={viewOnly}
      />
    </PackingDialog>
  );
};

export default EditReceiveShipmentDialog;
