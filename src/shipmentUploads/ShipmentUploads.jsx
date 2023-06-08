import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ImageDisplay from "./ImageDisplay";
import ImageUpload from "./ImageUpload";
import { SocketIoFactory } from "../socket";
import { API } from "../services/server";

const ShipmentUploads = () => {
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      API.getInstance().interceptors.request.use(
        (config) => {
          config.headers["Authorization"] = token;
          return config;
        },
        (error) => {
          Promise.reject(error);
        }
      );
    }

    const tempShipmentId = searchParams.get("tempShipmentId");
    if (tempShipmentId) {
      const socket = SocketIoFactory.getInstance(searchParams.get("token"));

      const processImages = (data) => {
        setImages(
          data.imageUrls.map((e) => {
            const priorImage = images.find((f) => {
              return f.path === e.path;
            });

            if (priorImage)
              return {
                file: priorImage.file,
                img: priorImage.img,
                path: e.path,
              };
            else
              return {
                file: undefined,
                img: e.url,
                path: e.path,
              };
          })
        );
      };

      socket.on("joinedRoom", processImages);

      socket.on("newDeletions", processImages);

      socket.on("connect", () => {
        socket.emit("joinTemp", { tempShipmentId });
      });

      socket.on("disconnect", () => {
        alert(
          "Error connecting to backend. Problems may arise with images uploaded here not showing up elsewhere"
        );
      });

      socket.connect();

      return () => {
        socket.off("connect");

        socket.disconnect();
      };
    }

    // eslint-disable-next-line
  }, [searchParams]);

  const registerUpdate = (imagePaths) => {
    const socket = SocketIoFactory.getInstance(searchParams.get("token"));

    socket.emit("uploadDone", {
      tempShipmentId: searchParams.get("tempShipmentId"),
      imagePaths,
    });
  };

  const onImageDelete = (imagePath) => {
    const socket = SocketIoFactory.getInstance(searchParams.get("token"));

    socket.emit("deleteUpload", {
      tempShipmentId: searchParams.get("tempShipmentId"),
      imagePath,
    });

    setImages((prevState) =>
      prevState.filter((e) => {
        return e.path !== imagePath;
      })
    );
  };

  return (
    <React.Fragment>
      <ImageDisplay
        images={images}
        onDelete={onImageDelete}
        isLoading={isLoading}
      />
      <ImageUpload
        tempShipmentId={searchParams.get("tempShipmentId")}
        setImageFiles={setImages}
        registerUpdate={registerUpdate}
        setIsLoading={setIsLoading}
      />
    </React.Fragment>
  );
};

export default ShipmentUploads;
