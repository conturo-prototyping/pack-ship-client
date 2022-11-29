import React, { useCallback } from "react";
import { Typography } from "@mui/material";
import { hasValueError } from "../../utils/validators/number_validator";
import DialogTable from "../../common/DialogTable";

const ReceiveShipmentTable = ({
  rowData,
  filledForm,
  setFilledForm,
  viewOnly = false,
  rowId = "id",
}) => {
  const columns = [
    {
      field: "part",
      renderCell: (params) => (
        <div>
          <Typography>{params.row.partNumber}</Typography>
          <Typography color="textSecondary">
            {params.row.partDescription}
          </Typography>
        </div>
      ),
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
      field: "qtyReceived",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Qty Received</Typography>;
      },
      flex: 1,
      default: 0,
      editable: !viewOnly,
      preProcessEditCellProps: (params) => {
        const hasError =
          !hasValueError(params.props.value) ||
          parseInt(params.props.value) < 0;
        return { ...params.props, error: hasError };
      },
    },
  ];

  const onEditRowsModelChange = useCallback(
    (params) => {
      if (params && Object.keys(params).length > 0) {
        setFilledForm(
          filledForm.map((e) => {
            if (Object.keys(params).includes(e[rowId])) {
              return {
                ...e,
                qtyReceived: parseInt(params[e[rowId]]["qtyReceived"]["value"]),
              };
            }
            return e;
          })
        );
      }
    },
    [filledForm, setFilledForm, rowId]
  );

  return (
    <DialogTable
      rowData={rowData}
      columns={columns}
      cellEditName="qtyReceived"
      onEditRowsModelChange={onEditRowsModelChange}
      viewOnly={viewOnly}
      rowId={rowId}
    />
  );
};

export default ReceiveShipmentTable;
