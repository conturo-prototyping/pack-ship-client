import PackingDialog from "../components/PackingDialog";
import EditPackingSlipTable from "./components/EditPackingSlipTable";
import { DialogActions } from "@mui/material";

const EditPackingSlipDialog = ({
  packingSlipData,
  isOpen,
  onClose,
  onSubmit,
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
      actions={viewOnly ? <DialogActions/> : undefined}
    >
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
