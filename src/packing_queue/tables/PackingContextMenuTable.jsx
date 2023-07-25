import React, { useCallback, useState } from "react";
import EditPackingSlipDialog from "../../edit_packing_slip/EditPackingSlipDialog";
import { API } from "../../services/server";
import { snackbarVariants, usePackShipSnackbar } from "../../common/Snackbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import pdfMake from "pdfmake/build/pdfmake";
import PackingContextMenu from "../menus/PackingContextMenu";
import { v4 as uuidv4 } from "uuid";

const PackingContextMenuTable = (OriginalTable) => {
  function NewComponent(props) {
    const { fetchData, filteredData, hasRouterUploads, preloadedFetchData } =
      props;

    const [contextMenu, setContextMenu] = useState(null);
    const [selectedRow, setSelectedRow] = useState({});

    // Deletions
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
      useState(false);
    const [itemToDelete, setItemToDelete] = useState();
    const [deleteDialog, setDeleteDialog] = useState(false);

    //Edit/View
    const [isEditPackingSlipOpen, setIsEditPackingSlipOpen] = useState({
      open: false,
      viewOnly: false,
    });

    const enqueueSnackbar = usePackShipSnackbar();

    const onHistoryPackingSlipAdd = useCallback(
      (pageNum) => {
        API.getPackingQueue().then((data) => {
          let newSelectedRow = { ...selectedRow };

          const possibleChoices = data?.filter(
            (e) =>
              e.orderNumber === selectedRow.orderNumber &&
              !selectedRow.items.some((t) => t.item._id === e._id)
          );

          if (data?.length > 0 && possibleChoices.length > 0) {
            newSelectedRow.items = newSelectedRow.items.map((e) => {
              if (e.item.isNew) {
                const newPossibleChoices = e.item.possibleItems.filter((t) => {
                  return (
                    t._id !== possibleChoices[0]._id || t._id === e.item._id
                  );
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
              const newPossibleChoices = data?.filter(
                (m) =>
                  m.customer === selectedRow.customer._id &&
                  (!updatedPackingSlip.items.some(
                    (t) => t.item._id === m._id
                  ) ||
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

    const onDestinationChange = useCallback(
      (newDest) => {
        setSelectedRow({
          ...selectedRow,
          destination: newDest,
        });
      },
      [selectedRow]
    );

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
          fetchData();
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
        const rowToUpload = selectedRow;

        if (hasRouterUploads) {
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
                const data = await API.getSignedUploadUrl(
                  e.routerUploadFilePath
                );

                const buffer = await e.uploadFile.arrayBuffer();
                let byteArray = new Int8Array(buffer);

                await API.uploadBySignedUrl(
                  data.url,
                  byteArray,
                  e.uploadFile.type
                );
              }
            })
          );

          rowToUpload.items = items;
        }

        API.patchPackingSlip(rowToUpload.id, {
          items: rowToUpload.items.map((e) => {
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
            if (preloadedFetchData) {
              preloadedFetchData();
            } else fetchData();
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

    const handleContextMenu = (event) => {
      event.preventDefault();
      const selectedRow = event.currentTarget.getAttribute("data-id");
      setSelectedRow(filteredData.find((e) => e._id === selectedRow));
      setContextMenu(
        contextMenu === null
          ? { mouseX: event.clientX, mouseY: event.clientY }
          : null
      );
    };

    const onUploadClick = useCallback(() => {
      if (hasRouterUploads)
        setSelectedRow({
          ...selectedRow,
          url: true,
        });
    }, [selectedRow, hasRouterUploads]);

    const onUploadCancelClick = useCallback(
      (itemId) => {
        if (hasRouterUploads)
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
      [selectedRow, hasRouterUploads]
    );

    const onUploadRouterClick = (params, isReady, file) => {
      if (hasRouterUploads) {
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
      }
    };

    return (
      <div>
        <OriginalTable
          fetchData={fetchData}
          handleContextMenu={handleContextMenu}
          {...props}
        />

        <PackingContextMenu
          openViewPackingSlip={openViewPackingSlip}
          onDownloadPDFClick={onDownloadPDFClick}
          openEditPackingSlip={openEditPackingSlip}
          openDeleteDialog={openDeleteDialog}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
        />
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
          onDelete={(params) => {
            setConfirmDeleteDialogOpen(true);
            setItemToDelete(params.row);
          }}
          onUploadClick={onUploadClick}
          onUploadCancelClick={onUploadCancelClick}
          onUploadRouterClick={onUploadRouterClick}
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
  }
  return NewComponent;
};

export default PackingContextMenuTable;
