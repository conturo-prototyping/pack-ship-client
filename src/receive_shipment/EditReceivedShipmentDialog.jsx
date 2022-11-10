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

  const rowData = useMemo(() => {
    const receivedQuantities = parts?.receivedQuantities;
    if (receivedQuantities) {
      return receivedQuantities.map((e) => {
        return {
          ...e,
          id: e._id,
          qtyReceived: e.qty,
        };
      });
    }
    return [];
  }, [parts]);

  const originalReceivedOn = useMemo(() => parts.receivedOn, [parts]);

  useEffect(() => {
    setReceivedOn(parts.receivedOn);
  }, [parts]);

  useEffect(() => {
    setFilledForm(rowData);
    console.log("ROWDATA", rowData);
    setOriginalData(rowData);
  }, [rowData]);

  useEffect(() => {
    setDisplayDateHelper(receivedOn === "" || receivedOn === undefined);
  }, [receivedOn]);

  const isSubmittable = useCallback(() => {
    const hasChanged = () => {
      console.log(
        "HASCHANGED",
        filledForm?.some(
          (e, index) => e.qtyReceived !== originalData[index].qtyReceived
        ),
        receivedOn !== originalReceivedOn
      );
      return (
        filledForm?.some(
          (e, index) => e.qtyReceived !== originalData[index].qtyReceived
        ) || receivedOn !== originalReceivedOn
      );
    };

    console.log(
      filledForm?.every(
        (e) => e.qtyReceived !== undefined && e.qtyReceived > 0
      ),
      hasChanged(),
      !displayDateHelper
    );
    return (
      filledForm?.every(
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
      onSubmit={() => onSubmit(filledForm, parts[0]?.id, receivedOn)}
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
