import React, { useEffect } from "react";
import { Typography } from "@mui/material";
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

const PackingSlipTable = ({
  rowData,
  filledForm,
  setFilledForm,
  viewOnly = false,
}) => {
  const classes = useStyle();
  const apiRef = useGridApiRef();

  const handleCellClick = React.useCallback(
    (params) => {
      if (params.field === "packQty" && !viewOnly) {
        apiRef.current.setCellMode(params.id, params.field, "edit");
      }
    },
    [apiRef, viewOnly]
  );

  useEffect(() => {
    if (!viewOnly) {
      apiRef.current.setCellFocus(rowData[0].id, "packQty");
      apiRef.current.setCellMode(rowData[0].id, "packQty", "edit");

      return apiRef.current.subscribeEvent(
        "cellModeChange",
        (event) => {
          event.defaultMuiPrevented = true;
        },
        { isFirst: true }
      );
    }
    // eslint-disable-next-line
  }, []);

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
  ];

  return (
    <DialogTable
      rowData={rowData}
      filledForm={filledForm}
      setFilledForm={setFilledForm}
      columns={columns}
      cellEditName="packQty"
      viewOnly={viewOnly}
    />
  );
};

export default PackingSlipTable;
