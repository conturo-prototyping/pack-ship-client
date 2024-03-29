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
  NAV_BAR_HEIGHT,
  PAGINATION_SIZING_OPTIONS,
} from "../../utils/Constants";
import { onPageSizeChange } from "../../utils/TablePageSizeHandler";
import { v4 as uuidv4 } from "uuid";
import withPendingTable from "./PackingContextMenuTable";

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
    field: "orderId",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Order</Typography>;
    },
    flex: 1,
  },
  {
    field: "label",
    renderHeader: () => {
      return (
        <Typography sx={{ fontWeight: 900 }}>Packing Slip Label</Typography>
      );
    },
    flex: 2,
  },
  {
    field: "destination",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Destination</Typography>;
    },
    flex: 1,
  },
  {
    field: "dateCreated",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Date Created</Typography>;
    },
    flex: 1,
  },
];

const HistoryTable = ({
  sortModel,
  setSortModel,
  fetchData,
  histTotalCount,
  historyLoading,
  filteredData,
  histResultsPerPage,
  orderNumber,
  partNumber,
  pageNumber,
  onPageChange,
  setHistResultsPerPage,
  handleContextMenu,
}) => {
  const classes = useStyle();
  const [isMounted, setIsMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
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
      fetchData(getSortFromModel(sortModel), 0, "", "").finally(() => {});
    }
    // eslint-disable-next-line
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) reloadData();
  }, [reloadData, isMounted]);

  const onHistoryPackingSlipAdd = useCallback(
    (pageNum) => {
      API.getPackingQueue().then((data) => {
        let newSelectedRow = { ...selectedRow };

        const possibleChoices = data.filter(
          (e) =>
            e.orderNumber === selectedRow.orderNumber &&
            !selectedRow.items.some((t) => t.item._id === e._id)
        );
        if (data?.length > 0 && possibleChoices.length > 0) {
          newSelectedRow.items = newSelectedRow.items.map((e) => {
            if (e.item.isNew) {
              const newPossibleChoices = e.item.possibleItems.filter((t) => {
                return t._id !== possibleChoices[0]._id || t._id === e.item._id;
              });

              return {
                ...e,
                item: {
                  ...e.item,
                  possibleItems: newPossibleChoices,
                },
              };
            }
            return e;
          });

          newSelectedRow.items.push({
            _id: possibleChoices[0]._id,
            id: possibleChoices[0]._id,
            rowId: possibleChoices[0]._id,
            pageNum: pageNum,
            item: {
              _id: possibleChoices[0]._id,
              id: possibleChoices[0]._id,
              rowId: possibleChoices[0]._id,
              isNew: true,
              possibleItems: possibleChoices,
              ...possibleChoices[0],
            },
            qty: undefined,
          });

          setSelectedRow(newSelectedRow);
        } else {
          alert("There are no additions that can be made.");
        }
      });
    },
    [selectedRow]
  );

  const onNewPartRowChange = useCallback(
    (oldVal, newVal) => {
      const itemIndex = selectedRow?.items?.findIndex(
        (e) => e.item._id === oldVal._id
      );
      let updatedPackingSlip = {
        ...selectedRow,
      };

      updatedPackingSlip.items[itemIndex] = {
        ...updatedPackingSlip.items[itemIndex],
        item: {
          ...oldVal,
          ...newVal,
        },
      };

      API.getPackingQueue().then((data) => {
        updatedPackingSlip.items = updatedPackingSlip.items.map((e) => {
          if (e.item.isNew) {
            const newPossibleChoices = data.filter(
              (m) =>
                m.customer === selectedRow.customer._id &&
                (!updatedPackingSlip.items.some((t) => t.item._id === m._id) ||
                  m._id === e.item._id)
            );

            return {
              ...e,
              item: {
                ...e.item,
                possibleItems: newPossibleChoices,
              },
            };
          }
          return e;
        });
        setSelectedRow(updatedPackingSlip);
      });
    },
    [selectedRow]
  );

  const onPackQtyChange = useCallback(
    (id, value) => {
      setTimeout(() => {
        const itemIndex = selectedRow?.items?.findIndex(
          (e) => e._id === id || e.item._id === id
        );
        let updatedPackingSlip = {
          ...selectedRow,
        };

        if (
          !isNaN(value) &&
          updatedPackingSlip.items[itemIndex].qty !== value &&
          value !== undefined
        ) {
          updatedPackingSlip.items[itemIndex] = {
            ...updatedPackingSlip.items[itemIndex],
            item: {
              ...updatedPackingSlip.items[itemIndex].item,
              packQty: value,
            },
            qty: value,
          };

          setSelectedRow(updatedPackingSlip);
        }
      }, 0);
    },
    [selectedRow]
  );

  const onUploadCancelClick = useCallback(
    (itemId) => {
      setTimeout(() => {
        const itemIndex = selectedRow?.items?.findIndex(
          (e) => e._id === itemId || e.item._id === itemId
        );
        let updatedPackingSlip = {
          ...selectedRow,
        };

        if (itemIndex !== undefined) {
          updatedPackingSlip.items[itemIndex] = {
            ...updatedPackingSlip.items[itemIndex],
            removeUpload: true,
          };

          setSelectedRow(updatedPackingSlip);
        }
      }, 0);
    },
    [selectedRow]
  );

  const onUploadRouterClick = (params, isReady, file) => {
    params.api.updateRows([{ id: params.id, routerUploadReady: isReady }]);

    setSelectedRow({
      ...selectedRow,
      items: selectedRow.items.map((e) => {
        if (params.id === e._id) {
          return {
            ...e,
            routerUploadReady: isReady,
            uploadFile: file,
            removeUpload: false,
          };
        }
        return e;
      }),
    });
  };

  const onDestinationChange = useCallback(
    (newDest) => {
      setSelectedRow({
        ...selectedRow,
        destination: newDest,
      });
    },
    [selectedRow]
  );

  const onUploadClick = useCallback(() => {
    setSelectedRow({
      ...selectedRow,
      url: true,
    });
  }, [selectedRow]);

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
    setContextMenu(null);
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
    setContextMenu(null);
  };

  const onPackingSlipClose = () => {
    setIsEditPackingSlipOpen({ open: false, viewOnly: false });
  };

  const onPackingSlipSubmit = async () => {
    if (isEditPackingSlipOpen.viewOnly) {
      setIsEditPackingSlipOpen({ open: false, viewOnly: false });
    } else {
      await Promise.all(
        selectedRow.items.map(async (e) => {
          if (e.removeUpload && e.routerUploadFilePath) {
            return await API.deleteRouterURL(selectedRow._id, e._id);
          }
        })
      );

      const items = selectedRow.items.map((e) => {
        if (
          (!e.routerUploadFilePath || e.item.routerUploadReady) &&
          e.uploadFile
        ) {
          e.routerUploadFilePath = `${selectedRow.customer._id}/${
            selectedRow.orderNumber
          }/${e._id}-${uuidv4()}`;

          return {
            ...e,
            routerUploadFilePath: e.routerUploadFilePath,
            newUpload: true,
          };
        }
        return e;
      });

      await Promise.all(
        items.map(async (e) => {
          if (e.newUpload) {
            const data = await API.getSignedUploadUrl(e.routerUploadFilePath);

            const buffer = await e.uploadFile.arrayBuffer();
            let byteArray = new Int8Array(buffer);

            await API.uploadBySignedUrl(data.url, byteArray, e.uploadFile.type);
          }
        })
      );

      API.patchPackingSlip(selectedRow.id, {
        items: items.map((e) => {
          return {
            ...e,
            qty: e.qty || e.item.packQty,
            routerUploadFilePath: e.removeUpload
              ? undefined
              : e.routerUploadFilePath,
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
      setContextMenu(null);
    }, 0);
  };

  const onDownloadPDFClick = useCallback(async () => {
    await API.downloadPDF(
      selectedRow._id,
      selectedRow.orderNumber,
      selectedRow.dateCreatedValue
    )
      .then((data) => {
        pdfMake.createPdf(data.docDefinition).open();
        setContextMenu(null);
        enqueueSnackbar("Packing slip downloaded", snackbarVariants.success);
      })
      .catch((e) => {
        enqueueSnackbar(e.message, snackbarVariants.error);
      });
  }, [selectedRow, enqueueSnackbar]);

  const historyRowMenuOptions = useMemo(
    () => [
      <MenuItem key={"View"} onClick={openViewPackingSlip}>
        View
      </MenuItem>,
      <MenuItem key={"Download"} onClick={onDownloadPDFClick}>
        Download
      </MenuItem>,
      <MenuItem key={"Edit"} onClick={openEditPackingSlip}>
        Edit
      </MenuItem>,
      <MenuItem key={"Delete"} onClick={openDeleteDialog}>
        Delete
      </MenuItem>,
    ],
    [onDownloadPDFClick]
  );

  return (
    <div className={classes.root}>
      <DataGrid
        paginationMode="server"
        onPageChange={onPageChange}
        rowCount={histTotalCount}
        sx={{
          border: "none",
          height: `calc(100vh - ${PACKING_SLIP_BOTTOM_MARGIN} - ${PACKING_SLIP_TOP_MARGIN} - ${NAV_BAR_HEIGHT} - 5rem)`,
          minHeight: "20rem",
          ".MuiDataGrid-footerContainer": {
            backgroundColor: "primary.light",
          },
        }}
        className={classes.table}
        disableSelectionOnClick={true}
        rows={historyLoading ? [] : filteredData}
        rowHeight={65}
        page={pageNumber}
        columns={columns}
        pageSize={histResultsPerPage}
        rowsPerPageOptions={PAGINATION_SIZING_OPTIONS}
        onPageSizeChange={(newPageSize) => {
          onPageSizeChange(
            newPageSize,
            pageNumber,
            filteredData.length,
            onPageChange,
            setHistResultsPerPage
          );
        }}
        checkboxSelection={false}
        editMode="row"
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={async (model) => {
          setSortModel(model);
          await fetchData(
            getSortFromModel(model),
            pageNumber,
            orderNumber,
            partNumber
          );
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
      <EditPackingSlipDialog
        isOpen={isEditPackingSlipOpen.open}
        viewOnly={isEditPackingSlipOpen.viewOnly}
        onClose={onPackingSlipClose}
        onSubmit={onPackingSlipSubmit}
        onDestinationChange={onDestinationChange}
        packingSlipData={selectedRow}
        onAdd={onHistoryPackingSlipAdd}
        onNewPartRowChange={onNewPartRowChange}
        onPackQtyChange={onPackQtyChange}
        onUploadClick={onUploadClick}
        onUploadCancelClick={onUploadCancelClick}
        onUploadRouterClick={onUploadRouterClick}
        onDelete={(params) => {
          setConfirmDeleteDialogOpen(true);
          setItemToDelete(params.row);
        }}
      />
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

export default withPendingTable(HistoryTable);
