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
      light: "#ffd78f",
      main: "#ffbc43",
      dark: "#f69e00",
    },
    secondary: {
      contrastText: "#fffafa",
      light: "#F4F4F4",
      main: "#a8a7a7",
      dark: "#757575",
    },
  },
});

export default theme;
