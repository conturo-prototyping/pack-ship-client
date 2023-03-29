import React, { useState, useEffect } from "react";
import PackingSlipTable from "./components/PackingSlipTable";
import DestinationToggle from "./components/DestinationToggle";
import PackingDialog from "../components/PackingDialog";
import { DestinationTypes } from "../utils/Constants";
import { useGridApiRef } from "@mui/x-data-grid-pro";

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
  const apiRef = useGridApiRef();

  useEffect(() => {
    setFilledForm(parts);
  }, [parts]);

  function isSubmittable() {
    let allHaveRouterUpload = false;
    if (apiRef.current !== null && Object.keys(apiRef.current).length !== 0) {
      allHaveRouterUpload = apiRef.current
        .getAllRowIds()
        .map((id) => apiRef.current.getRow(id))
        .every((e) => e.routerUploadReady);
    }
    return (
      filledForm.every((e) => e.packQty && e.packQty >= 0) &&
      allHaveRouterUpload
    );
  }

  const onUploadRouterClick = (params, isReady, file) => {
    params.api.updateRows([{ id: params.id, routerUploadReady: isReady }]);

    setFilledForm(
      filledForm.map((e) => {
        if (params.id === e.id) {
          return {
            ...e,
            routerUploadReady: isReady,
            uploadFile: file,
          };
        }
        return e;
      })
    );
  };

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
        onDestinationChange={onDestinationChange}
      />

      <PackingSlipTable
        apiRef={apiRef}
        rowData={parts}
        filledForm={filledForm}
        setFilledForm={setFilledForm}
        onUploadRouterClick={onUploadRouterClick}
        viewOnly={viewOnly}
      />
    </PackingDialog>
  );
};

export default PackingSlipDialog;
