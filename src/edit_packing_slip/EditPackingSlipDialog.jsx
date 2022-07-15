import PackingDialog from "../components/PackingDialog";
import EditPackingSlipTable from "./components/EditPackingSlipTable";
import { DialogActions } from "@mui/material";
import DestinationToggle from "../packing_slip/components/DestinationToggle";

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
    </PackingDialog>
  );
};

export default EditPackingSlipDialog;
