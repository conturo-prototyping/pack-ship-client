import { AppBar, Box, Button, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import { ROUTE_PACKING_SLIP, ROUTE_SHIPMENTS } from "./router";

const NavigationBar = () => {
  return (
    <Box>
      <AppBar component="nav" sx={{ display: "flex", alignItems: "flex-end" }}>
        <Toolbar>
          <div>
            <Button
              component={Link}
              to={ROUTE_PACKING_SLIP}
              key={ROUTE_PACKING_SLIP}
              sx={{ color: "black" }}
            >
              Packing
            </Button>
            <Button
              component={Link}
              to={ROUTE_SHIPMENTS}
              key={ROUTE_SHIPMENTS}
              sx={{ color: "black" }}
            >
              Shipments
            </Button>
            <Button
              component={Link}
              to={ROUTE_PACKING_SLIP}
              key={ROUTE_PACKING_SLIP}
              sx={{ color: "black" }}
              disabled={true}
            >
              Receiving
            </Button>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavigationBar;
