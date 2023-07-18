import React, { useState } from "react";
import PackingDialog from "../components/PackingDialog";
import CreateShipmentTable from "./components/CreateShipmentTable";
import ShippingDialogStates from "./constants/ShippingDialogConstants";
import CreateCarrierShipmentInfoForm from "./components/CreateShipmentInfoForm";
import CommonButton from "../common/Button";
import {
  Checkbox,
  DialogActions,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from "@mui/material";
import { API } from "../services/server";
import { useEffect } from "react";
import { isShippingInfoValid } from "../utils/Validators";
import { usePackShipSnackbar, snackbarVariants } from "../common/Snackbar";
import ShippingAddressForm from "./components/ShippingAddressForm";
import { DestinationTypes } from "../utils/Constants";
import PackShipDatePicker from "../components/PackShipDatePicker";
import QRCodeForm from "./components/QRCodeForm";
import { SocketIoFactory } from "../socket";
import ImageDisplay from "../shipmentUploads/ImageDisplay";
import { FilePathGenerator } from "../common/FilePathGenerator";
import { FileUploader } from "../services/fileUploader";

const CreateShipmentDialog = ({
  customer,
  destination,
  packingSlipIds,
  onClose,
  open,
  currentState,
  setCurrentState,
  parts,
  reloadData,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [shippingInfo, setShippingInfo] = useState({
    manifest: [],
    customer: "",
    deliveryMethod: "",
    checkedCustomer: false,
    isDueBack: false,
    isDueBackOn: null,
    carrier: "",
    specialShippingAddress: "",
  });
  const [canErrorCheck, setCanErrorCheck] = useState(false);
  const [reset, setReset] = useState(false);
  const [displayDateHelper, setDisplayDateHelper] = useState(false);
  const [qrCodeSource, setQrCodeSource] = useState();
  const [tempShipmentId, setTempShipmentId] = useState();
  const [images, setImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const enqueueSnackbar = usePackShipSnackbar();

  useEffect(() => {
    if (tempShipmentId) {
      const socket = SocketIoFactory.getInstance();

      if (socket.connected) {
        socket.disconnect(true);
      }

      const processImages = (data) => {
        setImages(
          data.imageUrls.map((e) => {
            return {
              file: undefined,
              img: e.url,
              path: e.path,
            };
          })
        );
      };

      socket.on("joinedRoom", processImages);

      socket.on("connect", () => {
        socket.emit("joinTemp", { tempShipmentId });
      });

      socket.on("newDeletions", processImages);

      socket.on("newUploads", processImages);

      socket.connect();

      return () => {
        socket.off("joinedRoom");
        socket.off("connect");
        socket.off("newDeletions");
        socket.off("newUploads");
        socket.disconnect(true);
      };
    }
  }, [tempShipmentId]);

  useEffect(() => {
    if (
      shippingInfo.customer !== customer?._id ||
      shippingInfo.manifest !== packingSlipIds
    )
      setShippingInfo({
        ...shippingInfo,
        customer: customer?._id,
        manifest: packingSlipIds,
      });
  }, [customer, packingSlipIds, shippingInfo]);

  useEffect(() => {
    setCustomerName("");
    setShippingInfo({
      manifest: packingSlipIds,
      customer: customer?._id,
      deliveryMethod: "",
      checkedCustomer: false,
      isDueBack: false,
      isDueBackOn: null,
      specialShippingAddress: "",
    });
    setCanErrorCheck(false);
  }, [open, customer?._id, packingSlipIds]);

  const onPickupClick = async () => {
    const newShippingInfo = {
      ...shippingInfo,
      deliveryMethod: "PICKUP",
      checkedCustomer: undefined,
      customerAccount: undefined,
    };
    setShippingInfo(newShippingInfo);
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    else {
      onSubmit(newShippingInfo);
    }
  };

  const onDropOffClick = async () => {
    const newShippingInfo = {
      ...shippingInfo,
      deliveryMethod: "DROPOFF",
      checkedCustomer: undefined,
      customerAccount: undefined,
    };
    setShippingInfo(newShippingInfo);
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    else {
      onSubmit(newShippingInfo);
    }
  };

  const onCarrierClick = () => {
    if (destination !== DestinationTypes.CUSTOMER) {
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    } else {
      setCurrentState(ShippingDialogStates.CarrierPage);
    }

    setShippingInfo({
      ...shippingInfo,
      deliveryMethod: "CARRIER",
      checkedCustomer: customer.defaultCarrierAccount !== undefined,
      customerAccount: customer.defaultCarrierAccount ?? "",
      carrier: customer.defaultCarrier ?? "",
    });
  };

  const onShippingAddressChange = (shippingAddress) => {
    setShippingInfo({
      ...shippingInfo,
      specialShippingAddress: shippingAddress,
    });
  };

  const onShippingAddressNextClick = () => {
    if (shippingInfo.deliveryMethod === "CARRIER") {
      if (
        shippingInfo?.specialShippingAddress === undefined ||
        shippingInfo?.specialShippingAddress === ""
      ) {
        setCanErrorCheck(true);
      } else {
        setCanErrorCheck(false);
        setCurrentState(ShippingDialogStates.CarrierPage);
      }
    }
  };

  const onNextClick = async () => {
    if (shippingInfo.isDueBack && !shippingInfo.isDueBackOn?.isValid()) {
      setDisplayDateHelper(true);
    } else {
      const tempShipment = await API.createTempShipment(shippingInfo.manifest);
      const response = await API.generateQRCode(tempShipment._id);

      setTempShipmentId(tempShipment._id);
      setQrCodeSource(response);
      setCurrentState(ShippingDialogStates.DisplayQRPage);
      setDisplayDateHelper(false);
    }
  };

  const onResetClick = () => {
    setReset(true);
    setCanErrorCheck(false);
  };

  const onBackClick = (reset = true) => {
    if (destination !== DestinationTypes.CUSTOMER)
      setCurrentState(ShippingDialogStates.ShippingAddressPage);
    else setCurrentState(ShippingDialogStates.SelectMethodPage);
    setCustomerName("");
    setDisplayDateHelper(false);
    if (reset) onResetClick();
  };

  const onBackShippingAddress = () => {
    setCurrentState(ShippingDialogStates.SelectMethodPage);
    setCustomerName("");
    setShippingInfo({
      ...shippingInfo,
      specialShippingAddress: undefined,
    });
    onResetClick();
  };

  const onDisplayQRBack = async () => {
    await API.deleteTempShipment(tempShipmentId);
    setCurrentState(ShippingDialogStates.CreateShipmentTable);
  };

  const onDisplayQRNext = () => {
    setCurrentState(ShippingDialogStates.QRReviewPage);
  };

  const onSelectMethodBack = () => {
    setCurrentState(ShippingDialogStates.QRReviewPage);
  };

  const onQRReviewNext = () => {
    setCurrentState(ShippingDialogStates.SelectMethodPage);
  };

  const onQRReviewBack = () => {
    setCurrentState(ShippingDialogStates.DisplayQRPage);
  };

  const onIsDueBackClick = (checked) => {
    if (checked) {
      setShippingInfo({
        ...shippingInfo,
        isDueBack: checked,
      });
    } else {
      setShippingInfo({
        ...shippingInfo,
        isDueBack: checked,
        isDueBackOn: null,
      });
      setDisplayDateHelper(false);
    }
  };

  const onImageDelete = (imagePath) => {
    const socket = SocketIoFactory.getInstance();

    socket.emit("deleteUpload", {
      tempShipmentId,
      imagePath,
    });

    setImages((prevState) =>
      prevState.filter((e) => {
        return e.path !== imagePath;
      })
    );
  };

  const onSubmit = async (localShippingInfo) => {
    setCanErrorCheck(true);
    if (isShippingInfoValid(localShippingInfo, destination)) {
      API.createShipmentFromTemp(
        tempShipmentId,
        localShippingInfo.customer,
        localShippingInfo.deliveryMethod,
        localShippingInfo.trackingNumber,
        localShippingInfo.cost,
        localShippingInfo.carrier,
        localShippingInfo.deliverySpeed,
        localShippingInfo.checkedCustomer
          ? localShippingInfo.customerAccount
          : false,
        customerName,
        localShippingInfo.specialShippingAddress,
        localShippingInfo.isDueBack,
        localShippingInfo.isDueBackOn
      )
        .then(async () => {
          setCustomerName("");
          setDisplayDateHelper(false);
          setShippingInfo({
            manifest: [],
            customer: "",
            deliveryMethod: "",
            checkedCustomer: false,
            isDueBack: false,
            isDueBackOn: null,
            specialShippingAddress: "",
          });

          reloadData();
          onClose();
          enqueueSnackbar(
            "Shipment created successfully!",
            snackbarVariants.success
          );
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    }
  };

  const onUploadPress = async (e) => {
    e.stopPropagation(); // don't select this row after clicking
    setIsLoadingImages(true);

    const images = Array.from(e.target.files).map((e) => {
      return {
        file: e,
        img: URL.createObjectURL(e),
        path: FilePathGenerator.createTempShipmentpRouterPath(tempShipmentId),
      };
    });

    await Promise.all(
      images.map(async (image) => {
        await FileUploader.uploadFile(image.path, image.file);
      })
    );

    setImages((prevState) => [...prevState, ...images]);

    registerUpdate(
      images.map((e) => {
        return e.path;
      })
    );

    setIsLoadingImages(false);
  };

  const registerUpdate = (imagePaths) => {
    const socket = SocketIoFactory.getInstance();

    socket.emit("uploadDone", {
      tempShipmentId,
      imagePaths,
    });
  };

  const renderContents = () => {
    switch (currentState) {
      case ShippingDialogStates.SelectMethodPage:
        break;
      case ShippingDialogStates.DisplayQRPage:
        return <QRCodeForm source={qrCodeSource} />;
      case ShippingDialogStates.QRReviewPage:
        return (
          <ImageDisplay
            images={images}
            onDelete={onImageDelete}
            isLoading={isLoadingImages}
          />
        );
      case ShippingDialogStates.CarrierPage:
        return (
          <CreateCarrierShipmentInfoForm
            shippingInfo={shippingInfo}
            setShippingInfo={setShippingInfo}
            canErrorCheck={canErrorCheck}
            reset={reset}
            setReset={setReset}
            destination={destination}
            disablePendingFields
          />
        );
      case ShippingDialogStates.ShippingAddressPage:
        return (
          <ShippingAddressForm
            shippingAddress={shippingInfo.specialShippingAddress ?? ""}
            setShippingAddress={onShippingAddressChange}
            canErrorCheck={canErrorCheck}
          />
        );
      case ShippingDialogStates.CreateShipmentTable:
      default:
        return (
          <CreateShipmentTable
            rowData={parts.map((e) => {
              return {
                ...e.item,
                id: e.id,
                part: {
                  header: `${e.partNumber} - Rev${e.partRev}`,
                  description: e.partDescription,
                },
                qty: e.qty,
                batchNumber: e.item.batch,
              };
            })}
          />
        );
    }
  };

  const renderDialogActions = () => {
    switch (currentState) {
      case ShippingDialogStates.DisplayQRPage:
        return (
          <DialogActions>
            <CommonButton
              onClick={onDisplayQRBack}
              label="Back"
              color="secondary"
            />
            <CommonButton
              autoFocus
              onClick={onDisplayQRNext}
              label={"Next"}
              type="button"
            />
          </DialogActions>
        );
      case ShippingDialogStates.QRReviewPage:
        return (
          <DialogActions>
            <CommonButton
              sx={{ marginRight: "0.5rem" }}
              label={"Input File"}
              component="label"
              type={"button"}>
              <input
                id="shipment-uploads-review"
                accept="*"
                type="file"
                multiple
                hidden
                onChange={onUploadPress}
              />
            </CommonButton>

            <CommonButton
              onClick={onQRReviewBack}
              label="Back"
              color="secondary"
            />
            <CommonButton
              autoFocus
              disabled={images.length === 0}
              onClick={onQRReviewNext}
              label={"Next"}
              type="button"
            />
          </DialogActions>
        );
      case ShippingDialogStates.SelectMethodPage:
        return (
          <DialogActions sx={{ padding: "25px" }}>
            <CommonButton onClick={onSelectMethodBack} label="Back" />
            <CommonButton onClick={onPickupClick} label="Pickup" />
            <CommonButton onClick={onDropOffClick} label="Drop Off" />
            <CommonButton onClick={onCarrierClick} label="Carrier" />
          </DialogActions>
        );
      case ShippingDialogStates.CarrierPage:
        return (
          <DialogActions sx={{ justifyContent: "normal" }}>
            <Grid container>
              <Grid item xs>
                <CommonButton onClick={onResetClick} label={"Reset"} />
              </Grid>
              <Grid container item xs justifyContent="flex-end" spacing={1}>
                <Grid item>
                  <CommonButton
                    onClick={() => {
                      onBackClick(destination !== DestinationTypes.VENDOR);
                    }}
                    label="Back"
                    color="secondary"
                  />
                </Grid>
                <Grid item>
                  <CommonButton
                    autoFocus
                    onClick={async () => {
                      await onSubmit(shippingInfo);
                    }}
                    label={"OK"}
                    type="button"
                  />
                </Grid>
              </Grid>
            </Grid>
          </DialogActions>
        );
      case ShippingDialogStates.ShippingAddressPage:
        return (
          <DialogActions>
            <CommonButton
              onClick={onBackShippingAddress}
              label="Back"
              color="secondary"
            />
            {shippingInfo.deliveryMethod === "CARRIER" ? (
              <CommonButton
                autoFocus
                onClick={onShippingAddressNextClick}
                label={"Next"}
                type="button"
              />
            ) : (
              <CommonButton
                autoFocus
                onClick={async () => {
                  await onSubmit(shippingInfo);
                }}
                label={"Ok"}
                type="button"
              />
            )}
          </DialogActions>
        );
      case ShippingDialogStates.CreateShipmentTable:
      default:
        return (
          <DialogActions>
            <Grid
              style={{
                paddingLeft: "20px",
                paddingBottom: "20px",
                paddingRight: "20px",
              }}
              container
              item
              direction="row"
              spacing={1}
              justifyContent="space-evenly">
              <Grid
                xs={4}
                container
                item
                direction="row"
                spacing={1}
                justifyContent="left">
                <Grid xs={6} item>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={false}
                          defaultValue={false}
                          value={shippingInfo.isDueBack}
                          onChange={(_, checked) => onIsDueBackClick(checked)}
                        />
                      }
                      label={
                        <Typography style={{ fontWeight: "bold" }}>
                          Is Due Back?
                        </Typography>
                      }
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={6}>
                  <PackShipDatePicker
                    disabled={!shippingInfo.isDueBack}
                    value={shippingInfo.isDueBackOn}
                    disablePast={true}
                    label="Due Back Date"
                    onChange={(newValue) => {
                      setShippingInfo({
                        ...shippingInfo,
                        isDueBackOn: newValue,
                      });
                      setDisplayDateHelper(!newValue?.isValid());
                    }}
                    displayDateHelper={displayDateHelper}
                  />
                </Grid>
              </Grid>

              <Grid
                xs={8}
                container
                item
                direction="row"
                spacing={1}
                justifyContent="right">
                <Grid item>
                  <CommonButton
                    onClick={() => {
                      onClose();
                      setDisplayDateHelper(false);
                    }}
                    label="Cancel"
                    color="secondary"
                  />
                </Grid>
                <Grid item>
                  <CommonButton
                    autoFocus
                    onClick={onNextClick}
                    label={"Next"}
                  />
                </Grid>
              </Grid>
            </Grid>
          </DialogActions>
        );
    }
  };

  const getDisplayDestination = () => {
    return destination
      ? destination[0]?.toUpperCase() + destination.slice(1)?.toLowerCase()
      : "Unknown";
  };

  return (
    <PackingDialog
      fullWidth={currentState === ShippingDialogStates.CreateShipmentTable}
      titleText={`Create ${getDisplayDestination()} Shipment / ${
        customer?.tag
      }`}
      open={open}
      onClose={onClose}
      actions={renderDialogActions()}>
      {renderContents()}
    </PackingDialog>
  );
};

export default CreateShipmentDialog;
