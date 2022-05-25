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
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
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
    field: "packingSlipId",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Packing Slip #</Typography>;
    },
    flex: 2,
  },
  {
    field: "dateCreated",
    renderHeader: () => {
      return <Typography sx={{ fontWeight: 900 }}>Date Created</Typography>;
    },
    flex: 1,
  },
];

const HistoryTable = ({ sortModel, setSortModel, searchString }) => {
  const classes = useStyle();

  const [menuPosition, setMenuPosition] = useState();

  const [selectedRow, setSelectedRow] = useState({});
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);

  // Deletions
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState();
  const [deleteDialog, setDeleteDialog] = useState(false);

  //Edit/View
  const [isEditPackingSlipOpen, setIsEditPackingSlipOpen] = useState({
    open: false,
    viewOnly: false,
  });

  const reloadData = useCallback(() => {
    async function fetchData() {
      return await API.getPackingSlipHistory();
    }

    fetchData().then((data) => {
      let packingSlips =
        data?.packingSlips?.map((e) => {
          return {
            ...e,
            id: e._id,
            orderId: e.orderNumber,
            dateCreated: new Date(e.dateCreated).toLocaleString(),
          };
        }) || [];
      setRows(packingSlips);
      setFilteredRows(packingSlips);
    });
  }, []);

  useEffect(() => {
    setFilteredRows(
      rows?.filter(
        (order) => {
          // console.log(order);

          return (order.orderNumber
            ?.toLowerCase()
            ?.includes(searchString.toLowerCase()) ) ||
          (order.packingSlipId
            ?.toLowerCase()
            ?.includes(searchString.toLowerCase()) );
        }
      )
    );
  }, [rows, searchString]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

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
            _id: "",
            pageNum: pageNum,
            item: {
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

  function onNewPartRowChange(oldVal, newVal) {
    const itemIndex = selectedRow?.items?.findIndex(
      (e) =>
        e.item.orderNumber === oldVal.orderNumber &&
        e.item.partNumber === oldVal.partNumber
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
  }

  function onPackQtyChange(id, value) {
    const itemIndex = selectedRow?.items?.findIndex(
      (e) => e._id === id || e.item._id === id
    );
    let updatedPackingSlip = {
      ...selectedRow,
    };

    updatedPackingSlip.items[itemIndex] = {
      ...updatedPackingSlip.items[itemIndex],
      item: { ...updatedPackingSlip.items[itemIndex].item, packQty: value },
      qty: value,
    };

    setSelectedRow(updatedPackingSlip);
  }

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
      API.patchPackingSlip(selectedRow.id, {
        items: itemsWithoutItem,
      })
        .then((_) => {
          setSelectedRow({
            ...selectedRow,
            items: itemsWithoutItem,
          });
          reloadData();
        })
        .catch((_) => alert("Failed to delete item from packing slip"));
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
      })
      .catch(() => {
        alert("An error occurred deleting packing slip");
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
      })
        .then(() => {
          setIsEditPackingSlipOpen({ open: false, viewOnly: false });
          reloadData();
        })
        .catch(() => {
          alert("Failed to submit edits.");
        });
    }
  };

  const openEditPackingSlip = () => {
    setTimeout(() => {
      setIsEditPackingSlipOpen({ open: true, viewOnly: false });
      setMenuPosition(null);
    }, 0);
  };

  const onDownloadPDFClick = useCallback(async () => {
    await API.downloadPDF(
      selectedRow._id,
      selectedRow.orderNumber,
      selectedRow.dateCreated
    )
      .then((data) => {
        pdfMake.createPdf(data.docDefinition).open();
        setMenuPosition(null);
      })
      .catch(() => {
        alert("Could not download packing slip");
      });
  }, [selectedRow]);

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
        sx={{ border: "none", height: "65vh" }}
        className={classes.table}
        rows={filteredRows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection={false}
        disableSelectionOnClick
        onRowClick={(params, event, details) => {
          setSelectedRow(params.row);
          setMenuPosition({ left: event.pageX, top: event.pageY });
        }}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
      />
      <ContextMenu
        menuPosition={menuPosition}
        setMenuPosition={setMenuPosition}
      >
        {historyRowMenuOptions}
      </ContextMenu>
      <EditPackingSlipDialog
        isOpen={isEditPackingSlipOpen.open}
        viewOnly={isEditPackingSlipOpen.viewOnly}
        onClose={onPackingSlipClose}
        onSubmit={onPackingSlipSubmit}
        packingSlipData={selectedRow}
        onAdd={onHistoryPackingSlipAdd}
        onNewPartRowChange={onNewPartRowChange}
        onPackQtyChange={onPackQtyChange}
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

export default HistoryTable;
