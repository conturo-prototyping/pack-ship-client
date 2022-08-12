import PackingDialog from "../components/PackingDialog";
import EditPackingSlipTable from "./components/EditPackingSlipTable";
import { DialogActions, Grid, Typography } from "@mui/material";
import DestinationToggle from "../packing_slip/components/DestinationToggle";
import { fontWeight } from "@mui/system";

const EditPackingSlipDialog = ({
  packingSlipData,
  isOpen,
  onClose,
  onSubmit,
  onDestinationChange,
  onAdd,
  onDelete,
  onNewPartRowChange,
  onPackQtyChange,
  cellEditing = false,
  viewOnly = true,
}) => {
  console.log(packingSlipData);
  return (
    <PackingDialog
      open={isOpen}
      titleText={`${viewOnly ? "" : "Edit Packing Slip / "}${
        packingSlipData?.packingSlipId
      }`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitDisabled={cellEditing}
      actions={viewOnly ? <DialogActions /> : undefined}
    >
      <DestinationToggle
        onDestinationChange={onDestinationChange}
        destination={packingSlipData.destination}
        disabled={viewOnly}
      ></DestinationToggle>
      <EditPackingSlipTable
        rowData={packingSlipData}
        onAdd={onAdd}
        onDelete={onDelete}
        onNewPartRowChange={onNewPartRowChange}
        onPackQtyChange={onPackQtyChange}
        viewOnly={viewOnly}
      />
      <Grid container justifyContent="end">
        {packingSlipData.shipment ? (
          <Typography fontWeight="bold">SHIPPED</Typography>
        ) : (
          <Typography fontWeight="bold">STAGED</Typography>
        )}
      </Grid>
    </PackingDialog>
  );
};

export default EditPackingSlipDialog;
