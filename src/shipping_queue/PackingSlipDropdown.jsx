import React, { useState } from "react";
import { Typography, List, ListItemText, ListItemButton } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { DataGrid } from "@mui/x-data-grid";

const PackingSlipDrowdown = ({ params, packingSlipId, manifest }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <List>
        <ListItemButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={packingSlipId} />
        </ListItemButton>
        {isOpen && (
          <DataGrid
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoHeight
            rows={manifest
              .find((e) => e._id === params.id)
              ?.items.map((e) => {
                return {
                  id: e.item._id,
                  part: e.item,
                  batchQty: e.item.quantity,
                  shipQty: e.qty,
                };
              })}
            columns={[
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
                      <Typography>{`${item.partNumber} - Rev ${item.partRev} (Batch ${item.batch})`}</Typography>
                      <Typography color="textSecondary">
                        {item.partDescription}
                      </Typography>
                    </div>
                  );
                },
              },
              {
                field: "batchQty",
                flex: 2,
                renderHeader: (params) => {
                  return (
                    <Typography sx={{ fontWeight: 900 }}>Batch Qty</Typography>
                  );
                },
              },
              {
                field: "shipQty",
                flex: 2,
                renderHeader: (params) => {
                  return (
                    <Typography sx={{ fontWeight: 900 }}>Ship Qty</Typography>
                  );
                },
              },
            ]}
          />
        )}
      </List>
    </div>
  );
};

export default PackingSlipDrowdown;
