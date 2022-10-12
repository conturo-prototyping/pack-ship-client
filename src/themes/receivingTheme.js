import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Arial",
    button: {
      textTransform: "none",
      fontSize: "18px",
      fontWeight: "bold",
    },
  },
  palette: {
    primary: {
      contrastText: "#808080",
      light: "#8CC8D2",
      main: "#048785",
      dark: "#005271",
    },
    secondary: {
      contrastText: "#808080",
      light: "#F4F4F4",
      main: "#bbdefb",
      dark: "#7cc0f8",
    },
  },
});

export default theme;
