import React, { useState } from "react";
import {
  List,
  ListItemText,
  ListItemButton,
  Collapse,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { DataGrid } from "@mui/x-data-grid";

const ShipQueuePackSlipDrowdown = ({ params }) => {
  const [isOpen, setIsOpen] = useState(false);

  const columns = [
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
      field: "batchNumber",
      flex: 2,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Batch Number</Typography>;
      },
    },
    {
      field: "batchQty",
      flex: 2,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Batch Qty</Typography>;
      },
    },
    {
      field: "packQty",
      flex: 2,
      renderHeader: (params) => {
        return <Typography sx={{ fontWeight: 900 }}>Packed Qty</Typography>;
      },
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <List>
        <ListItemButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}>
          {isOpen ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={params.row.label} />
        </ListItemButton>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <DataGrid
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoHeight
            disableSelectionOnClick
            onCellClick={(_, event) => event.stopPropagation()}
            rows={params.row.items.map((e) => {
              return {
                id: e.item._id,
                part: e.item,
                batchQty: e.item.quantity,
                packQty: e.qty,
                batchNumber: e.item.batch,
              };
            })}
            columns={columns}
          />
        </Collapse>
      </List>
    </div>
  );
};

export default ShipQueuePackSlipDrowdown;
