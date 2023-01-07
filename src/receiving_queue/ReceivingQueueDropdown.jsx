import React, { useState, useMemo } from "react";
import { Typography, List, ListItemText, ListItemButton } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { DataGrid } from "@mui/x-data-grid";
import { CONSUMABLE_PO, WORK_ORDER_PO } from "../common/ItemTypes";

const ReceivingQueueDropdown = ({ params }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tableData = useMemo(() => {
    if (params.row.poType === WORK_ORDER_PO)
      return params.row.manifest
        ?.map((e) => {
          return e.lines.map((m) => {
            return {
              id: e._id + m._id,
              item: m.item,
              order: m.packingSlip.orderNumber,
              part: {
                partNumber: m.item.PartNumber,
                partRev: m.item.Revision,
                partDescription: m.item.PartName,
              },
              batch: m.item.batchNumber,
              qty: m.qtyRequested,
              poNum: e.PONumber,
            };
          });
        })
        .reduce((curr, acc) => {
          return curr.concat(acc);
        }, []);
    else if (params.row.poType === CONSUMABLE_PO)
      return params.row.manifest
        ?.map((e) => {
          return e.lines.map((m) => {
            return {
              id: e._id + m._id,
              item: m.item,
              qty: m.qtyRequested,
              poNum: e.PONumber,
            };
          });
        })
        .reduce((curr, acc) => {
          return curr.concat(acc);
        }, []);
  }, [params.row.manifest, params.row.poType]);

  const columns = useMemo(() => {
    if (params.row.poType === WORK_ORDER_PO)
      return [
        {
          field: "order",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>Order</Typography>;
          },
        },
        {
          field: "part",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>Part</Typography>;
          },
          renderCell: (params) => {
            const item = params.row.part;
            return (
              <div>
                <Typography>{`${item.partNumber} - Rev ${item.partRev}`}</Typography>
                <Typography color="textSecondary">
                  {item.partDescription}
                </Typography>
              </div>
            );
          },
        },
        {
          field: "batch",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>Batch</Typography>;
          },
        },
        {
          field: "qty",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>Qty</Typography>;
          },
        },
        {
          field: "poNum",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>PO Num</Typography>;
          },
        },
      ];
    else if (params.row.poType === CONSUMABLE_PO)
      return [
        {
          field: "item",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>Item</Typography>;
          },
        },
        {
          field: "qty",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>Qty</Typography>;
          },
        },
        {
          field: "poNum",
          flex: 2,
          renderHeader: (params) => {
            return <Typography sx={{ fontWeight: 900 }}>PO Num</Typography>;
          },
        },
      ];
  }, [params.row.poType]);

  return (
    <div style={{ width: "100%" }}>
      <List>
        <ListItemButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={params.row.label} />
        </ListItemButton>
        {isOpen && (
          <DataGrid
            autoHeight
            columns={columns}
            disableColumnMenu
            hideFooter
            pageSize={tableData.length}
            rows={tableData}
          />
        )}
      </List>
    </div>
  );
};

export default ReceivingQueueDropdown;
