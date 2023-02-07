import React, { useCallback } from "react";
import { Typography } from "@mui/material";
import { hasValueError } from "../../utils/validators/number_validator";
import DialogTable from "../../common/DialogTable";
import { WORK_ORDER_PO } from "../../common/ItemTypes";

const ReceiveShipmentTable = ({
  rowData,
  filledForm,
  setFilledForm,
  type,
  viewOnly = false,
}) => {
  const columns =
    type === WORK_ORDER_PO
      ? [
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
              return (
                <Typography sx={{ fontWeight: 900 }}>Qty Received</Typography>
              );
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
        ]
      : [
          {
            field: "item",
            flex: 2,
            renderHeader: (params) => {
              return <Typography sx={{ fontWeight: 900 }}>Item</Typography>;
            },
          },
          {
            field: "qty",
            flex: 2,
            renderHeader: (params) => {
              return <Typography sx={{ fontWeight: 900 }}>Qty</Typography>;
            },
          },
          {
            field: "qtyReceived",
            renderHeader: (params) => {
              return (
                <Typography sx={{ fontWeight: 900 }}>Qty Received</Typography>
              );
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
            if (Object.keys(params).includes(e.id)) {
              return {
                ...e,
                qtyReceived: parseInt(params[e.id]["qtyReceived"]["value"]),
              };
            }
            return e;
          })
        );
      }
    },
    [filledForm, setFilledForm]
  );

  return (
    <DialogTable
      rowData={rowData}
      columns={columns}
      cellEditName="qtyReceived"
      onEditRowsModelChange={onEditRowsModelChange}
      viewOnly={viewOnly}
    />
  );
};

export default ReceiveShipmentTable;
