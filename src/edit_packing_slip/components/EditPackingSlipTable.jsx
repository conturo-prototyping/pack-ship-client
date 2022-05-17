import { hasValueError } from "../../utils/validators/number_validator";
import { Typography } from "@mui/material";
import PackShipEditableTable from "../../components/EdittableTable";
import EditTableDropdown from "../../components/EditTableDropdown";

const EditPackingSlipTable = ({
  rowData,
  onDelete,
  onAdd,
  onNewPartRowChange,
  onPackQtyChange,
  viewOnly,
}) => {
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
              {`${params.row.partNumber} - Rev ${params.row.partRev} (Batch ${params.row.batch})`}
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
          Object.keys(params).map((e) => 
          onPackQtyChange(
            e,
            params[e]["packQty"]["value"]
          )
          )
        }
      }}
      editMode={"row"}
      viewOnly={viewOnly}
    />
  );
};

export default EditPackingSlipTable;
