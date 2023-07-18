import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { PackShipProgress } from "../common/CircularProgress";

const useStyle = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: "40rem",
    padding: "0.5rem",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
  },
  titleBar: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
  icon: {
    color: "white",
  },
}));

const ImageDisplay = ({ images, onDelete, isLoading }) => {
  const classes = useStyle();
  const BORDER_RADIUS = "25px";

  return (
    <div className={classes.root}>
      {isLoading ? (
        <PackShipProgress />
      ) : (
        <>
          {images.length > 0 ? (
            <ImageList
              variant="masonry"
              cols={3}
              gap={10}
              className={classes.gridList}>
              {images?.map((item) => (
                <ImageListItem key={item.img}>
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    style={{ borderRadius: BORDER_RADIUS }}
                  />
                  {onDelete ? (
                    <ImageListItemBar
                      sx={{
                        borderTopLeftRadius: BORDER_RADIUS,
                        borderTopRightRadius: BORDER_RADIUS,
                      }}
                      title={item.title}
                      position="top"
                      actionIcon={
                        <IconButton
                          key={item.img}
                          className={classes.icon}
                          onClick={() => {
                            onDelete(item.path);
                          }}>
                          <DeleteIcon />
                        </IconButton>
                      }
                      actionPosition="right"
                      className={classes.titleBar}
                    />
                  ) : (
                    <></>
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <Typography variant="h6" sx={{ position: "absolute", top: "45%" }}>
              Waiting for Image Upload
            </Typography>
          )}
        </>
      )}
    </div>
  );
};

export default ImageDisplay;
