import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FileUploader } from "../services/fileUploader";
import { FilePathGenerator } from "../common/FilePathGenerator";

const ImageUpload = ({
  tempShipmentId,
  setImageFiles,
  registerUpdate,
  setIsLoading,
}) => {
  const onUploadPress = async (e) => {
    e.stopPropagation(); // don't select this row after clicking
    setIsLoading(true);

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

    setImageFiles((prevState) => [...prevState, ...images]);

    registerUpdate(
      images.map((e) => {
        return e.path;
      })
    );
    setIsLoading(false);
  };

  return (
    <>
      <input
        id="shipments-upload-fab"
        accept="*"
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={onUploadPress}
      />
      <label
        style={{
          margin: "0px",
          top: "auto",
          right: "20px",
          bottom: "20px",
          left: "auto",
          position: "fixed",
        }}
        htmlFor="shipments-upload-fab">
        <Fab color="primary" component="span">
          <AddIcon />
        </Fab>
      </label>
    </>
  );
};

export default ImageUpload;
