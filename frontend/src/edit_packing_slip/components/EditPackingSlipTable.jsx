import { hasValueError } from "../../utils/validators/number_validator";
import { Typography } from "@mui/material";
import PackShipEditableTable from "../../components/EdittableTable";
import EditTableDropdown from "../../components/EditTableDropdown";

const EditPackingSlipTable = ({
  rowData,
  onDelete,
  onAdd,
  onNewOrderNumRowChange,
  onNewPartRowChange,
  onPackQtyChange,
  setEditing,
  viewOnly,
}) => {
  function renderOrderNum(params) {
    if (params.row.isNew && params.row.packQty === undefined) {
      return (
        <EditTableDropdown
          choices={params.row.possibleItems.filter(
            (v, i, a) =>
              a.findIndex((t) => t.orderNumber === v.orderNumber) === i
          )}
          value={params.row}
          onChange={onNewOrderNumRowChange}
          valueKey="orderNumber"
        />
      );
    } else {
      return (
        <Typography
          variant="body1"
          component="p"
          sx={{ padding: "4px" }}
          color="textSecondary"
        >
          {params.row.orderNumber}
        </Typography>
      );
    }
  }

  function renderPart(params) {
    if (params.row.isNew && params.row.packQty === undefined) {
      return (
        <EditTableDropdown
          menuKeyValue={"orderNumber"}
          choices={params.row.possibleItems.filter(
            (e) => e.orderNumber === params.row.orderNumber
          )}
          value={params.row}
          onChange={onNewPartRowChange}
          valueKey="partNumber"
        />
      );
    } else {
      if (params.row.partNumber !== undefined) {
        return (
          <div>
            <Typography sx={{ padding: "4px" }} color="textSecondary">
              {`${params.row.partNumber} - Rev ${params.row.partRev}`}
            </Typography>
            <Typography sx={{ padding: "4px" }} color="textSecondary">
              {params.row.partDescription}
            </Typography>
          </div>
        );
      }
    }
  }

  const columns = [
    {
      field: "orderNumber",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Order#</Typography>;
      },
      renderCell: renderOrderNum,
      flex: 1,
    },
    {
      field: "part",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Part</Typography>;
      },
      renderCell: renderPart,
      flex: 1,
    },
    {
      field: "quantity",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Batch Qty</Typography>;
      },
      type: "number",
      flex: 1,
    },
    {
      field: "packQty",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Pack Qty</Typography>;
      },
      flex: 1,
      default: 0,
      type: "number",
      editable: !viewOnly,
      preProcessEditCellProps: (params) => {
        const hasError = !hasValueError(params.props.value);
        return { ...params.props, error: hasError };
      },
    },
  ];

  return (
    <PackShipEditableTable
      sx={{
        "& .MuiDataGrid-cell--editable": {
          border: "solid 1px grey",
          fontStyle: "italic",
          ":hover": {
            border: "solid 1px black",
          },
        },
      }}
      tableData={rowData.items.map((e) => {
        return {
          ...e.item,
          id: e._id || e.item._id,
          packQty: e.qty,
          quantity: e.item.batchQty || e.item.quantity,
        };
      })}
      columns={columns}
      onDelete={onDelete}
      onAdd={onAdd}
      onEditRowsModelChange={(params) => {
        if (params && Object.keys(params).length > 0) {
          onPackQtyChange(
            Object.keys(params)[0],
            params[Object.keys(params)[0]]["packQty"]["value"]
          );
        }
      }}
      viewOnly={viewOnly}
    />
  );
};

export default EditPackingSlipTable;
