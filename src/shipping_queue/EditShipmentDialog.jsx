import React, { useEffect, useState } from "react";
import {
  Typography,
  DialogActions,
  Dialog,
  DialogContent,
  Grid,
} from "@mui/material";
import PackShipEditableTable from "../components/EdittableTable";
import PopupDialog from "../components/PackingDialog";
import PackingSlipDrowdown from "./PackingSlipDropdown";
import ShipmentDetails from "./ShipmentDetails";
import EditTableDropdown from "../components/EditTableDropdown";
import { ADD_ROW_ID } from "../utils/Constants";
import CommonButton from "../common/Button";
import ImageDisplay from "../shipmentUploads/ImageDisplay";
import Preview from "../packing_slip/components/Preview";
import PreviewPopup from "../components/PreviewPopup";

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
  onDeleteRouterImage,
  viewOnly = true,
  cantEditShippingDetails = {
    customerAccount: true,
    trackingNumber: true,
    cost: true,
  },
}) => {
  const [imageDisplayOpen, setImageDisplayOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (shipment)
      setImages(
        shipment.shipmentImageUrls.map((e) => {
          return {
            ...e,
            img: e.url,
          };
        })
      );
  }, [shipment]);

  const onViewClick = () => {
    setImageDisplayOpen(true);
  };

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
      flex: 8,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Packing Slip</Typography>;
      },
    },
  ];

  return (
    <div>
      <PopupDialog
        open={isOpen}
        titleText={`${viewOnly ? "" : "Edit Shipment / "}${shipment?.label} (${
          shipment?.manifest?.[0]?.destination
        })`}
        onClose={onClose}
        onSubmit={onSubmit}
        prependActions={!viewOnly}
        actions={
          viewOnly ? (
            <DialogActions sx={{ height: "43.5px" }}>
              <CommonButton label="View Files" onClick={onViewClick} />
            </DialogActions>
          ) : (
            <CommonButton label="View Files" onClick={onViewClick} />
          )
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
        <Grid container direction={"row"}>
          <Grid item xs={10}>
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
              cantEditShippingDetails={cantEditShippingDetails}
            />
          </Grid>

          <Grid item xs={2}>
            {shipment?.confirmShipmentFileUrl && (
              <Preview
                height={200}
                url={shipment?.confirmShipmentFileUrl[0]}
                type={shipment?.confirmShipmentFileUrl[1]}
                onPreviewClick={() => setShowPreview(true)}
              />
            )}
          </Grid>
        </Grid>
        <PreviewPopup
          height={800}
          url={shipment?.confirmShipmentFileUrl[0]}
          type={shipment?.confirmShipmentFileUrl[1]}
          onClose={() => setShowPreview(false)}
          showPreview={showPreview}
        />
        <Dialog
          open={imageDisplayOpen}
          fullWidth={true}
          maxWidth="lg"
          onClose={() => setImageDisplayOpen(false)}
        >
          <DialogContent>
            <ImageDisplay
              images={images}
              onDelete={viewOnly ? undefined : onDeleteRouterImage}
              isLoading={false}
            />
          </DialogContent>
        </Dialog>
      </PopupDialog>
    </div>
  );
};

export default EditShipmentTableDialog;
