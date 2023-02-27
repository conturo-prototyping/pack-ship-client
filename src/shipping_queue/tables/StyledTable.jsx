import React from "react";
import { styled } from "@mui/system";
import makeStyles from "@mui/styles/makeStyles";
import { DataGrid } from "@mui/x-data-grid";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
}));

const StyledDataGrid = styled(DataGrid)`
  .MuiDataGrid-row {
    max-height: fit-content !important;
  }

  .MuiDataGrid-renderingZone {
    max-height: none !important;
  }

  .MuiDataGrid-cell {
    max-height: fit-content !important;
    overflow: auto;
    height: auto;
    line-height: none !important;
    align-items: center;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
`;

const StyledTable = (OriginalTable) => {
  function NewComponent(props) {
    const classes = useStyle();
    return (
      <div className={classes.root}>
        <OriginalTable {...props} StyledDataGrid={StyledDataGrid} />
      </div>
    );
  }
  return NewComponent;
};

export default StyledTable;
