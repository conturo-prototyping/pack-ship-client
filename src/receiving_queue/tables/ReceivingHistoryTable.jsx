import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import ContextMenu from "../../components/GenericContextMenu";
import MenuItem from "@mui/material/MenuItem";
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PackShipProgress } from "../../common/CircularProgress";
import {
  PACKING_SLIP_TOP_MARGIN,
  PACKING_SLIP_BOTTOM_MARGIN,
} from "../../utils/Constants";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    minHeight: "20rem",
  },
  table: {
    backgroundColor: "white",
    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
      {
        display: "none",
      },
  },
}));

const columns = [
  {
    field: "label",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Shipment ID</Typography>;
    },
    flex: 1,
  },
  {
    field: "receivedOn",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Date Received</Typography>;
    },
    flex: 1,
  },
];

const ReceivingHistoryTable = ({
  sortModel,
  setSortModel,
  fetchSearch,
  historyLoading,
  filteredHist,
}) => {
  const classes = useStyle();

  const [isMounted, setIsMounted] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reloadData = useCallback(() => {
    if (isMounted) {
      fetchSearch().finally(() => {});
    }
    // eslint-disable-next-line
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) reloadData();
  }, [reloadData, isMounted]);

  const historyRowMenuOptions = useMemo(
    () => [
      <MenuItem
        key={"View"}
        onClick={() => {
          setContextMenu(null);
        }}
      >
        View
      </MenuItem>,
      <MenuItem
        key={"Edit"}
        onClick={() => {
          setContextMenu(null);
        }}
      >
        Edit
      </MenuItem>,
      <MenuItem
        key={"Undo Receipt"}
        onClick={() => {
          setContextMenu(null);
        }}
      >
        Delete
      </MenuItem>,
    ],
    []
  );

  const handleContextMenu = (event) => {
    event.preventDefault();
    const selectedRowId = event.currentTarget.getAttribute("data-id");
    if (selectedRowId) {
      setContextMenu(
        contextMenu === null
          ? { mouseX: event.clientX, mouseY: event.clientY }
          : null
      );
      // TODO CALL SOMETHING?
      // API.getShipment(selectedRowId).then((data) => {
      //   if (data) {
      //     setClickedHistShipment(data.shipment);
      //   }
      // });
    }
  };

  return (
    <div className={classes.root}>
      <DataGrid
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - 15rem)`,
          minHeight: "20rem",
        }}
        className={classes.table}
        disableSelectionOnClick={true}
        rows={historyLoading ? [] : filteredHist}
        rowHeight={65}
        columns={columns}
        rowsPerPageOptions={[10]}
        checkboxSelection={false}
        editMode="row"
        pageSize={10}
        sortModel={sortModel}
        onSortModelChange={async (model) => {
          setSortModel(model);
          await fetchSearch();
        }}
        loading={historyLoading}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
        }}
        componentsProps={{
          row: {
            onContextMenu: handleContextMenu,
          },
        }}
      />

      <ContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu}>
        {historyRowMenuOptions}
      </ContextMenu>
    </div>
  );
};

export default ReceivingHistoryTable;
