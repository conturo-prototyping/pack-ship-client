import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";
import PackShipEditableTable from "../components/EdittableTable";
import PopupDialog from "../components/PackingDialog";
import PackingSlipDrowdown from "./PackingSlipDropdown";
import ShipmentDetails from "./ShipmentDetails";
import EditTableDropdown from "../components/EditTableDropdown";

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
          onChange={(newVal) => {
            onNewRowChange(params.row, newVal);
          }}
          value={params.row}
        />
      );
    } else if (params.id !== "add-row-id") {
      return (
        <PackingSlipDrowdown
          params={params}
          packingSlipId={params.row.packingSlipId}
          manifest={shipment.manifest}
        />
      );
    }
  }

  const columns = [
    {
      field: "packingSlipId",
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
        titleText={`${viewOnly ? "" : "Edit Shipment / "}${
          shipment?.shipmentId
        }`}
        onClose={onClose}
        onSubmit={onSubmit}
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
          onTrackingChange={onTrackingChange}
          onCostChange={onCostChange}
          viewOnly={viewOnly}
        />
      </PopupDialog>
    </div>
  );
};

export default EditShipmentTableDialog;
