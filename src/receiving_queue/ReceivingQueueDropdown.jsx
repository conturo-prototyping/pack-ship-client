import React, { useState, useMemo } from "react";
import { Typography, List, ListItemText, ListItemButton } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { DataGrid } from "@mui/x-data-grid";

const ReceivingQueueDropdown = ({ params }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tableData = useMemo(() => {
    return params.row.manifest?.map((e) => {
      return {
        id: e.item.orderBumber + e.item.partNumber,
        item: e.item,
        order: e.item.orderNumber,
        part: e.item,
        batch: e.item.batch,
        qty: e.qty,
      };
    });
  }, [params.row.manifest]);

  return (
    <div style={{ width: "100%" }}>
      <List>
        <ListItemButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}>
          {isOpen ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={params.row.shipmentId} />
        </ListItemButton>
        {isOpen && (
          <DataGrid
            pageSize={tableData.length}
            autoHeight
            hideFooter
            rows={tableData}
            columns={[
              {
                field: "order",
                flex: 2,
                renderHeader: (params) => {
                  return (
                    <Typography sx={{ fontWeight: 900 }}>Order</Typography>
                  );
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
                  return (
                    <Typography sx={{ fontWeight: 900 }}>Batch</Typography>
                  );
                },
              },
              {
                field: "qty",
                flex: 2,
                renderHeader: (params) => {
                  return <Typography sx={{ fontWeight: 900 }}>Qty</Typography>;
                },
              },
            ]}
          />
        )}
      </List>
    </div>
  );
};

export default ReceivingQueueDropdown;
