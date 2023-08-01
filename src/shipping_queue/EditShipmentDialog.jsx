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
import UploadCell from "../packing_slip/components/UploadCell";

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
  onShippingImageChange,
  viewOnly = true,
  cantEditShippingDetails = {
    customerAccount: true,
    trackingNumber: true,
    cost: true,
  },
}) => {
  const [imageDisplayOpen, setImageDisplayOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [confirmShipmentFileUrl, setConfirmShipmentFileUrl] = useState();

  useEffect(() => {
    if (shipment?.confirmShipmentFileUrl) {
      if (shipment?.confirmShipmentFileUrl[0] instanceof File)
        setConfirmShipmentFileUrl([
          URL.createObjectURL(shipment?.confirmShipmentFileUrl[0]),
          shipment?.confirmShipmentFileUrl[1],
        ]);
      else setConfirmShipmentFileUrl(shipment?.confirmShipmentFileUrl);
    }
  }, [shipment?.confirmShipmentFileUrl]);

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
        submitDisabled={typeof confirmShipmentFileUrl !== "object"}>
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
            <UploadCell
              height={200}
              viewOnly={viewOnly}
              params={{
                id: "ShipmentUploadId",
                row: {
                  downloadUrl: confirmShipmentFileUrl
                    ? confirmShipmentFileUrl[0]
                    : undefined,
                  contentType: confirmShipmentFileUrl
                    ? confirmShipmentFileUrl[1]
                    : undefined,
                },
              }}
              onCloseClick={() => {
                setConfirmShipmentFileUrl(undefined);
              }}
              onUploadClick={(_, __, file) => {
                onShippingImageChange(file);
              }}
            />
          </Grid>
        </Grid>
        <Dialog
          open={imageDisplayOpen}
          fullWidth={true}
          maxWidth="lg"
          onClose={() => setImageDisplayOpen(false)}>
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
