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
      contrastText: "#808080",
      light: "#ffd78f",
      main: "#ffbc43",
      dark: "#f69e00",
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
