import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import ContextMenu from "../../components/GenericContextMenu";
import MenuItem from "@mui/material/MenuItem";
import { API } from "../../services/server";
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";
import EditPackingSlipDialog from "../../edit_packing_slip/EditPackingSlipDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PackShipProgress } from "../../common/CircularProgress";
import { getSortFromModel } from "../utils/sortModelFunctions";
import { snackbarVariants, usePackShipSnackbar } from "../../common/Snackbar";
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

  const [menuPosition, setMenuPosition] = useState();

  const [selectedRow, setSelectedRow] = useState({});

  // Deletions
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState();
  const [deleteDialog, setDeleteDialog] = useState(false);

  //Edit/View
  const [isEditPackingSlipOpen, setIsEditPackingSlipOpen] = useState({
    open: false,
    viewOnly: false,
  });

  const enqueueSnackbar = usePackShipSnackbar();

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

  function onItemDelete() {
    if (itemToDelete) {
      const itemsWithoutItem = selectedRow.items
        .filter((e) => e.item._id !== itemToDelete._id)
        .map((e) => {
          return {
            item: { ...e.item },
            qty: e.qty || e.item.packQty,
          };
        });
      setSelectedRow({
        ...selectedRow,
        items: itemsWithoutItem,
      });
    }
  }

  const openDeleteDialog = (event) => {
    setDeleteDialog(true);
    setMenuPosition(null);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialog(false);
  };

  async function deletePackingSlip() {
    API.deletePackingSlip(selectedRow?.id)
      .then(() => {
        handleDeleteConfirm();
        reloadData();
        enqueueSnackbar("Packing slip deleted!", snackbarVariants.success);
      })
      .catch((e) => {
        enqueueSnackbar(e.message, snackbarVariants.error);
      });
  }

  const openViewPackingSlip = () => {
    setIsEditPackingSlipOpen({ open: true, viewOnly: true });
    setMenuPosition(null);
  };

  const onPackingSlipClose = () => {
    setIsEditPackingSlipOpen({ open: false, viewOnly: false });
  };

  const onPackingSlipSubmit = () => {
    if (isEditPackingSlipOpen.viewOnly) {
      setIsEditPackingSlipOpen({ open: false, viewOnly: false });
    } else {
      API.patchPackingSlip(selectedRow.id, {
        items: selectedRow.items.map((e) => {
          return {
            item: { ...e.item },
            qty: e.qty || e.item.packQty,
          };
        }),
        destination: selectedRow?.destination,
      })
        .then(() => {
          setIsEditPackingSlipOpen({ open: false, viewOnly: false });
          reloadData();
          enqueueSnackbar("Packing slip edited!", snackbarVariants.success);
        })
        .catch((e) => {
          enqueueSnackbar(e.message, snackbarVariants.error);
        });
    }
  };

  const openEditPackingSlip = () => {
    setTimeout(() => {
      setIsEditPackingSlipOpen({ open: true, viewOnly: false });
      setMenuPosition(null);
    }, 0);
  };

  const historyRowMenuOptions = useMemo(
    () => [
      <MenuItem key={"View"} onClick={openViewPackingSlip}>
        View
      </MenuItem>,
      <MenuItem key={"Edit"} onClick={() => {}}>
        Edit
      </MenuItem>,
      <MenuItem key={"Delete"} onClick={openDeleteDialog}>
        Delete
      </MenuItem>,
    ],
    []
  );

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
        onRowClick={(params, event, details) => {
          setSelectedRow(params.row);
          setMenuPosition({ left: event.pageX, top: event.pageY });
        }}
        sortModel={sortModel}
        onSortModelChange={async (model) => {
          setSortModel(model);
          await fetchSearch();
        }}
        loading={historyLoading}
        components={{
          LoadingOverlay: () => <PackShipProgress />,
        }}
      />

      <ContextMenu
        menuPosition={menuPosition}
        setMenuPosition={setMenuPosition}
      >
        {historyRowMenuOptions}
      </ContextMenu>

      <ConfirmDialog
        title="Are You Sure You Want To Delete This?"
        open={confirmDeleteDialogOpen}
        setOpen={setConfirmDeleteDialogOpen}
        onConfirm={onItemDelete}
      />

      <ConfirmDialog
        title="Do You Want To Delete This?"
        open={deleteDialog}
        setOpen={setDeleteDialog}
        onConfirm={deletePackingSlip}
      />
    </div>
  );
};

export default ReceivingHistoryTable;
