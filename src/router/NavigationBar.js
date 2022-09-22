import { AppBar, Box, Tab, Tabs, Toolbar } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Link } from "react-router-dom";
import { ROUTE_PACKING_SLIP, ROUTE_SHIPMENTS, ROUTE_RECEIVING } from "./router";

// const CustomTab = withStyles({
//   selected: {
//     backgroundColor: "transparent",
//     color: "blue",
//     inkBarStyle: "black",
//   },
// })(Tab);

const styles = {
  // check https://material-ui.com/api/tab/#css
  // for more overridable styles
  root: {
    "&$selected": {
      backgroundColor: "transparent",
      color: "black",
    },
  },
  selected: {},
  textColorPrimary: {
    color: "#404040",
  },
};

const CustomTab = withStyles(styles)((props) => <Tab {...props} />);

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const NavigationBar = ({ value, onChange }) => {
  return (
    <Box>
      <AppBar
        component="nav"
        sx={{
          display: "flex",
          alignItems: "flex-end",
          borderBottom: 1,
          borderColor: "divider",
        }}>
        <Toolbar>
          <Tabs
            value={value}
            onChange={onChange}
            TabIndicatorProps={{
              title: "indicator",
              hidden: false,
              sx: { backgroundColor: "black", height: 4 },
            }}>
            <CustomTab
              component={Link}
              to={ROUTE_PACKING_SLIP}
              key={ROUTE_PACKING_SLIP}
              // style={{ textTransform: "none" }}
              {...a11yProps(0)}
              label="Packing"
            />
            <CustomTab
              component={Link}
              to={ROUTE_SHIPMENTS}
              key={ROUTE_SHIPMENTS}
              // style={{ color: "black", textTransform: "none" }}
              {...a11yProps(1)}
              label="Shipments"
            />
            <CustomTab
              component={Link}
              to={ROUTE_RECEIVING} // TODO change to a valid route
              key={ROUTE_RECEIVING} //TODO change to the route
              // style={{ textTransform: "none" }}
              {...a11yProps(2)}
              label="Receiving"
            />
          </Tabs>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavigationBar;
