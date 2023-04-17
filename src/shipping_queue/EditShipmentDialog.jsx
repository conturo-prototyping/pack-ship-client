import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography, DialogActions } from "@mui/material";
import PackShipEditableTable from "../components/EdittableTable";
import PopupDialog from "../components/PackingDialog";
import PackingSlipDrowdown from "./PackingSlipDropdown";
import ShipmentDetails from "./ShipmentDetails";
import EditTableDropdown from "../components/EditTableDropdown";
import { ADD_ROW_ID } from "../utils/Constants";

const useStyle = makeStyles((theme) => ({}));

const EditShipmentTableDialog = ({
  canErrorCheck,
  shipment,
  isOpen,
  onClose,
  onSubmit,
  onAdd,
  onDelete,
  onCarrierInputChange,
  onDeliverySpeedChange,
  onCustomerAccountChange,
  onCustomerNameChange,
  onShippingAddressChange,
  onTrackingChange,
  onCostChange,
  onNewRowChange,
  viewOnly = true,
}) => {
  const classes = useStyle();

  function renderDropdown(params) {
    if (params.row.isNew) {
      return (
        <EditTableDropdown
          choices={params.row.possibleSlips}
          onChange={onNewRowChange}
          value={params.row}
          valueKey="label"
          menuOptionFn={(e) => `${e.label}`}
        />
      );
    } else if (!params.id.includes(ADD_ROW_ID)) {
      return (
        <PackingSlipDrowdown
          params={params}
          label={params.row.label}
          manifest={shipment.manifest}
        />
      );
    }
  }

  const columns = [
    {
      field: "label",
      renderCell: (params) => {
        return renderDropdown(params);
      },
      flex: 2,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Packing Slip</Typography>;
      },
    },
  ];

  return (
    <div className={classes.root}>
      <PopupDialog
        open={isOpen}
        titleText={`${viewOnly ? "" : "Edit Shipment / "}${shipment?.label} (${
          shipment?.manifest?.[0]?.destination
        })`}
        onClose={onClose}
        onSubmit={onSubmit}
        actions={
          viewOnly ? <DialogActions sx={{ height: "43.5px" }} /> : undefined
        }
      >
        <PackShipEditableTable
          tableData={shipment?.manifest?.map((e) => {
            return { ...e, id: e._id };
          })}
          columns={columns}
          onDelete={onDelete}
          onAdd={onAdd}
          viewOnly={viewOnly}
        />
        <ShipmentDetails
          canErrorCheck={canErrorCheck}
          shipment={shipment}
          onCarrierInputChange={onCarrierInputChange}
          onDeliverySpeedChange={onDeliverySpeedChange}
          onCustomerAccountChange={onCustomerAccountChange}
          onCustomerNameChange={onCustomerNameChange}
          onShippingAddressChange={onShippingAddressChange}
          onTrackingChange={onTrackingChange}
          onCostChange={onCostChange}
          viewOnly={viewOnly}
        />
      </PopupDialog>
    </div>
  );
};

export default EditShipmentTableDialog;
