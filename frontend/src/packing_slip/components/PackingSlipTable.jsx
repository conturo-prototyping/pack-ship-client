import { Typography } from "@mui/material";
import HelpTooltip from "../../components/HelpTooltip";
import { makeStyles } from "@mui/styles";
import { hasValueError } from "../../utils/validators/number_validator";

const useStyle = makeStyles((theme) => ({
  fulfilledQtyHeader: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
}));

const PackingSlipTable = ({ rowData, filledForm, setFilledForm }) => {
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
  ];

  return (
    <PackShipDataGrid
      rowData={rowData}
      columns={columns}
      validateError={(params) => {
        setFilledForm(
          filledForm.map((e) => {
            if (e.id === params.id && params.field === "packQty") {
              return { ...e, packQty: params.value };
            }
            return e;
          })
        );
      }}
    />
  );
};

export default PackingSlipTable;
