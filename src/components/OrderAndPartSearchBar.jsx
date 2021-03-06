import React from "react";
import { Grid } from "@mui/material";
import CommonButton from "../common/Button";
import TextInput from "../components/TextInput";
import makeStyles from "@mui/styles/makeStyles";

const useStyle = makeStyles((theme) => ({
  topBarGrid: {
    boxSizing: "border-box",
    height: "5rem",
    marginBottom: "1rem!important",
    paddingTop: "1rem!important",
    paddingLeft: "1rem!important",
  },
}));

export const OrderPartNumberSearch = React.memo(
  ({
    partNumber,
    orderNumber,
    onClearClick,
    onSearchClick,
    setOrderNumber,
    setPartNumber,
  }) => {
    const classes = useStyle();

    return (
      <Grid
        className={classes.topBarGrid}
        container
        item
        justifyContent="flex-start"
        spacing={1}>
        <Grid container item xs={"auto"}>
          <CommonButton
            label="Clear"
            onClick={onClearClick}
            disabled={!orderNumber && !partNumber}
            color="error"
          />
        </Grid>
        <Grid container item xs={2} md={1}>
          <TextInput
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearchClick();
              }
            }}
            onChange={(e) => {
              if (
                (e === "" || e === undefined || e === null) &&
                (partNumber === "" ||
                  partNumber === undefined ||
                  partNumber === null)
              ) {
                onClearClick();
              }
              setOrderNumber(e);
            }}
            placeholder="Order"
            value={orderNumber}
            autoFocus
          />
        </Grid>
        <Grid container item xs={2} md={1}>
          <TextInput
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearchClick();
              }
            }}
            onChange={(e) => {
              if (
                (e === "" || e === undefined || e === null) &&
                (orderNumber === "" ||
                  orderNumber === undefined ||
                  orderNumber === null)
              ) {
                onClearClick();
              }
              setPartNumber(e);
            }}
            placeholder="Part"
            value={partNumber}
          />
        </Grid>
        <Grid container item xs={"auto"}>
          <CommonButton
            label="Search"
            onClick={onSearchClick}
            disabled={!orderNumber && !partNumber}
            sx={{ marginLeft: "2rem" }}
          />
        </Grid>
      </Grid>
    );
  }
);
