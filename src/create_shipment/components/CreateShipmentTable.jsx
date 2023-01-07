import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const CreateShipmentTable = ({ rowData }) => {
  const columns = [
    {
      field: "part",
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Part</Typography>;
      },
      renderCell: (params) => {
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
      },
      flex: 2,
    },
    {
      field: "batchNumber",
      flex: 2,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Batch Number</Typography>;
      },
    },
    {
      field: "quantity",
      type: "number",
      flex: 1,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Ship Qty</Typography>;
      },
      renderCell: (params) => {
        return <Typography color="textSecondary">{params.row.qty}</Typography>;
      },
    },
  ];

  return (
    <DataGrid
      autoHeight
      rows={rowData}
      columns={columns}
      disableColumnMenu
      disableSelectionOnClick
      rowHeight={65}
      pageSize={rowData.length}
      rowsPerPageOptions={[rowData.length]}
      hideFooter
    />
  );
};

export default CreateShipmentTable;
