import React, { useEffect } from "react";
import { Typography, Box } from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";
import { makeStyles } from "@mui/styles";
import { hasValueError } from "../../utils/validators/number_validator";
import { useGridApiRef } from "@mui/x-data-grid-pro";
import DialogTable from "../../common/DialogTable";

const useStyle = makeStyles((theme) => ({
  fulfilledQtyHeader: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
}));

const ReceiveShipmentTable = ({
  rowData,
  filledForm,
  setFilledForm,
  viewOnly = false,
}) => {
  const columns = [
    {
      field: "part",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Part</Typography>;
      },
      flex: 1,
    },
    {
      field: "qty",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Qty</Typography>;
      },
      type: "number",
      flex: 1,
    },
    {
      field: "receivedQty",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Qty Received</Typography>;
      },
      flex: 1,
      default: 0,
      editable: true,
      preProcessEditCellProps: (params) => {
        const hasError = !hasValueError(params.props.value);
        return { ...params.props, error: hasError };
      },
    },
  ];

  return (
    <DialogTable
      rowData={rowData}
      filledForm={filledForm}
      setFilledForm={setFilledForm}
      columns={columns}
      cellEditName="receivedQty"
      viewOnly={viewOnly}
    />
  );
};

export default ReceiveShipmentTable;
