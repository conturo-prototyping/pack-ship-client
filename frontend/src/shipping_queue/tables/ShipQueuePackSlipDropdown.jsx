import React, { useState } from "react";
import {
  List,
  ListItemText,
  ListItemButton,
  Collapse,
  ListItem,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const ShipQueuePackSlipDrowdown = ({ params }) => {
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
          <ListItemText primary={params.row.packingSlipId.split("-")[1]} />
        </ListItemButton>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {params.row.items.map((e) => (
              <ListItem key={e._id} divider>
                <ListItemText
                  primary={`${e.item.partNumber} (${
                    e.qty !== undefined ? e.qty : "-"
                  })`}
                  secondary={`${e.item.partDescription}`}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );
};

export default ShipQueuePackSlipDrowdown;
