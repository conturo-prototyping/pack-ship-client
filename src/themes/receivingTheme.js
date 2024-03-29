import { createTheme } from "@mui/material/styles";
import { baseTheme } from "./rootTheme";

const theme = createTheme({
  ...baseTheme,
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
      contrastText: "#000000",
      light: "#b6d7a8",
      main: "#b6d7a8",
      dark: "#b6d7a8",
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
