import React, { useCallback } from "react";
import { Typography } from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";
import { makeStyles } from "@mui/styles";
import { hasValueError } from "../../utils/validators/number_validator";
import DialogTable from "../../common/DialogTable";
import UploadCell from "./UploadCell";

const useStyle = makeStyles((theme) => ({
  fulfilledQtyHeader: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
}));

const PackingSlipTable = ({
  apiRef,
  rowData,
  filledForm,
  setFilledForm,
  onUploadRouterClick,
  viewOnly = false,
}) => {
  const classes = useStyle();

  const columns = [
    {
      field: "part",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Part</Typography>;
      },
      flex: 1,
    },
    {
      field: "batchQty",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Batch Qty</Typography>;
      },
      type: "number",
      flex: 1,
    },
    {
      field: "fulfilledQty",
      headerName: "Fulfilled Qty",
      type: "number",
      flex: 1,
      renderHeader: (params) => {
        return (
          <div className={classes.fulfilledQtyHeader}>
            <Typography sx={{ fontWeight: 900 }}>Fulfilled Qty</Typography>
            <HelpTooltip
              tooltipText={
                "This includes number of items that have been packed as well as number of items that have shipped."
              }
            />
          </div>
        );
      },
    },
    {
      field: "packQty",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Pack Qty</Typography>;
      },
      flex: 1,
      default: 0,
      editable: true,
      preProcessEditCellProps: (params) => {
        const hasError = !hasValueError(params.props.value);
        return { ...params.props, error: hasError };
      },
    },
    {
      field: "url",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Router Upload</Typography>;
      },
      flex: 1,
      renderCell: (params) => {
        return (
          <UploadCell
            key={params.id}
            params={params}
            onUploadClick={onUploadRouterClick}
          />
        );
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
                packQty: params[e.id]["packQty"]["value"],
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
      apiRef={apiRef}
      rowData={rowData}
      filledForm={filledForm}
      setFilledForm={setFilledForm}
      columns={columns}
      cellEditName="packQty"
      onEditRowsModelChange={onEditRowsModelChange}
      viewOnly={viewOnly}
    />
  );
};

export default PackingSlipTable;
